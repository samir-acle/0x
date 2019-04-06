import { Web3Wrapper } from "@0x/web3-wrapper";
import {
  SignerSubprovider,
  RPCSubprovider,
  Web3ProviderEngine
} from "@0x/subproviders";
import { Subject, interval } from "rxjs";
import { switchMap } from "rxjs/operators";

// TODO - improve this, return promise and await, or something similar
const providerEngine = new Web3ProviderEngine();
providerEngine.addProvider(new SignerSubprovider((window as any).ethereum));
providerEngine.addProvider(new RPCSubprovider("http://localhost:8545"));
providerEngine.start();
(window as any).ethereum.enable();
const web3Wrapper = new Web3Wrapper(providerEngine);

// maybe behavior subject
const accountSubject = new Subject<string[]>();

const userAccount$ = interval(1000).pipe(
  switchMap(() => {
    console.log("getting address");
    return web3Wrapper.getAvailableAddressesAsync();
  }),
  account => account
);

// this may subscribe prematurely - could change this and explicity call next on the subject
// it does
userAccount$.subscribe(accountSubject);

export default web3Wrapper;
export const account$ = accountSubject.asObservable();
