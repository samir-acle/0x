import React, { useContext, useEffect, useState } from "react";
import { Web3Context } from "./Web3Context";
import web3Wrapper, {
  account$,
  network$,
  contractAddresses$,
  contractWrappers$
} from "./setupWeb3";
import { zip, interval } from "rxjs";
import { switchMap, map } from "rxjs/operators";
import { Web3Wrapper } from "@0x/web3-wrapper";

export const useEthereumAccount = () => {
  const web3 = useContext(Web3Context);
  const [userAddress, setUserAddress] = useState("");

  useEffect(() => {
    const subscription = account$.subscribe(accounts =>
      setUserAddress(accounts[0])
    );
    return subscription.unsubscribe;
  }, []);

  return userAddress;
};

export const useAcceptedNetworkId = (acceptedNetworks: number[] = []) => {
  const web3 = useContext(Web3Context);
  const [networkId, setNetworkId] = useState(0);

  useEffect(() => {
    const subscription = network$.subscribe(networkId => {
      console.log(networkId);
      return setNetworkId(networkId);
    });
    return subscription.unsubscribe;
  }, []);

  return acceptedNetworks.includes(networkId);
};

// export const useContracts = () => {
//   const web3 = useContext(Web3Context);
//   const [contractWrapper, setContractWrapper] = useState();

//   useEffect(() => {
//     const subscription = contract$.subscribe(contractWrapper => {
//       console.log("new contract wrapper");
//       return setContractWrapper(contractWrapper);
//     });
//     return subscription.unsubscribe;
//   }, []);

//   return contractWrapper;
// };

export enum allowedTokens {
  Zrx = "zrx",
  Weth = "ether",
  Eth = "eth"
}

export const useOwnBalanceOf = (token: allowedTokens) => {
  const ownAccount = useEthereumAccount();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!ownAccount) return;

    const subscription = zip(contractWrappers$, contractAddresses$)
      .pipe(
        switchMap(([contractWrapper, contractAddresses]) => {
          return interval(1000).pipe(
            switchMap(() => {
              let tokenAddress;

              if (token === allowedTokens.Eth) {
                return web3Wrapper.getBalanceInWeiAsync(ownAccount);
              } else if (token === allowedTokens.Zrx) {
                tokenAddress = contractAddresses.zrxToken;
              } else {
                tokenAddress = contractAddresses.etherToken;
              }

              return contractWrapper.erc20Token.getBalanceAsync(
                tokenAddress,
                ownAccount
              );
            }),
            map(balance => Web3Wrapper.toUnitAmount(balance, 18)),
            map(balance => balance.toNumber())
          );
        })
      )
      .subscribe(balance => {
        console.log("balance of", token, ":", balance);
        return setBalance(balance);
      });

    return () => subscription.unsubscribe();
  }, [ownAccount]);

  return balance;
};
