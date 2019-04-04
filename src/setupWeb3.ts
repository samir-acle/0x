import { Web3Wrapper } from "@0x/web3-wrapper";
import {
  SignerSubprovider,
  RPCSubprovider,
  Web3ProviderEngine
} from "@0x/subproviders";

// TODO - improve this, return promise and await, or something similar
const providerEngine = new Web3ProviderEngine();
providerEngine.addProvider(new SignerSubprovider((window as any).ethereum));
providerEngine.addProvider(new RPCSubprovider("http://localhost:8545"));
providerEngine.start();
(window as any).ethereum.enable();
const web3Wrapper = new Web3Wrapper(providerEngine);
export default web3Wrapper;
