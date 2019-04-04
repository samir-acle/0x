import {
  assetDataUtils,
  BigNumber,
  ContractWrappers,
  generatePseudoRandomSalt,
  Order,
  orderHashUtils,
  signatureUtils
} from "0x.js";

import { HttpClient, OrderbookRequest, OrderConfigRequest } from "@0x/connect";
import { Web3Wrapper } from "@0x/web3-wrapper";
import { getContractAddressesForNetworkOrThrow } from "@0x/contract-addresses";

import { RPCSubprovider, Web3ProviderEngine } from "0x.js";

const NETWORK_CONFIGS = {
  networkId: 50
};

const DECIMALS = 18;

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
const TX_DEFAULTS = {
  gas: 500000
};

(async () => {
  const providerEngine = new Web3ProviderEngine();
  providerEngine.addProvider(new RPCSubprovider("http://localhost:8545"));
  providerEngine.start();

  const contractWrappers = new ContractWrappers(providerEngine, {
    networkId: NETWORK_CONFIGS.networkId
  });

  const web3Wrapper = new Web3Wrapper(providerEngine);
  const [maker, taker] = await web3Wrapper.getAvailableAddressesAsync();

  // Token Addresses
  const contractAddresses = getContractAddressesForNetworkOrThrow(
    NETWORK_CONFIGS.networkId
  );
  const zrxTokenAddress = contractAddresses.zrxToken;
  const etherTokenAddress = contractAddresses.etherToken;

  // this example trading 5 ZRX (ERC20) for 0.1 WETH (ERC20)
  const makerAssetData = assetDataUtils.encodeERC20AssetData(zrxTokenAddress);
  const takerAssetData = assetDataUtils.encodeERC20AssetData(etherTokenAddress);
  const makerAssetAmount = Web3Wrapper.toBaseUnitAmount(
    new BigNumber(5),
    DECIMALS
  );
  const takerAssetAmount = Web3Wrapper.toBaseUnitAmount(
    new BigNumber(0.1),
    DECIMALS
  );

  // allow 0x ERC20 proxy to move ZRX on behalf of makerAccount
  const makerZRXApprovalTxHash = await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
    zrxTokenAddress,
    maker
  );
  await web3Wrapper.awaitTransactionSuccessAsync(makerZRXApprovalTxHash);

  // allow the 0x ERC20 Proxy to ove WETH on behalf of the taker account
  const takerWETHApprovalTxHash = await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
    etherTokenAddress,
    taker
  );
  await web3Wrapper.awaitTransactionSuccessAsync(takerWETHApprovalTxHash);

  const takerWETHDepositTxHash = await contractWrappers.etherToken.depositAsync(
    etherTokenAddress,
    takerAssetAmount,
    taker
  );
  await web3Wrapper.awaitTransactionSuccessAsync(takerWETHDepositTxHash);

  const relayerApiUrl = "http://localhost:3000/v2";
  const relayerClient = new HttpClient(relayerApiUrl);

  const randomExpiration = new BigNumber(1556769600000 / 1000);
  const exchangeAddress = contractAddresses.exchange;

  const orderConfigRequest: OrderConfigRequest = {
    exchangeAddress,
    makerAddress: maker,
    takerAddress: NULL_ADDRESS,
    expirationTimeSeconds: randomExpiration,
    makerAssetAmount,
    takerAssetAmount,
    makerAssetData,
    takerAssetData
  };

  const orderConfig = await relayerClient.getOrderConfigAsync(
    orderConfigRequest
  );

  const order: Order = {
    salt: generatePseudoRandomSalt(),
    ...orderConfigRequest,
    ...orderConfig
  };

  const orderHashHex = orderHashUtils.getOrderHashHex(order);
  const signature = await signatureUtils.ecSignHashAsync(
    providerEngine,
    orderHashHex,
    maker
  );
  const signedOrder = {
    ...order,
    signature
  };

  // relayers should prune order book using this method
  await contractWrappers.exchange.validateOrderFillableOrThrowAsync(
    signedOrder
  );

  // submit to relayer for them to host on their orderbook
  await relayerClient.submitOrderAsync(signedOrder, {
    networkId: NETWORK_CONFIGS.networkId
  });

  const orderbookRequest: OrderbookRequest = {
    baseAssetData: makerAssetData,
    quoteAssetData: takerAssetData
  };

  const response = await relayerClient.getOrderbookAsync(orderbookRequest, {
    networkId: NETWORK_CONFIGS.networkId
  });
  if (response.asks.total === 0) {
    throw new Error("No order founds on the SRA endpoint");
  }

  const sraOrder = response.asks.records[0].order;
  await contractWrappers.exchange.validateFillOrderThrowIfInvalidAsync(
    sraOrder,
    takerAssetAmount,
    taker
  );

  const txHash = await contractWrappers.exchange.fillOrderAsync(
    sraOrder,
    takerAssetAmount,
    taker,
    {
      gasLimit: TX_DEFAULTS.gas
    }
  );
  await web3Wrapper.awaitTransactionMinedAsync(txHash);
})();
