import { Web3Wrapper } from "@0x/web3-wrapper";
import {
  SignerSubprovider,
  RPCSubprovider,
  Web3ProviderEngine
} from "@0x/subproviders";
import { Subject, interval } from "rxjs";
import { switchMap } from "rxjs/operators";
import { NetworkSubprovider } from "./NetworkSubprovider";
import React, { useContext, useEffect, useState } from "react";

// TODO - improve this, return promise and await, or something similar
const providerEngine = new Web3ProviderEngine();
providerEngine.addProvider(new NetworkSubprovider((window as any).ethereum));
providerEngine.addProvider(new SignerSubprovider((window as any).ethereum));
providerEngine.addProvider(new RPCSubprovider("http://localhost:8545"));
providerEngine.start();
(window as any).ethereum.enable();
const web3Wrapper = new Web3Wrapper(providerEngine);

const accountSubject = new Subject<string[]>();
const networkSubject = new Subject<number>();

export const userAccount$ = interval(1000).pipe(
  switchMap(() => {
    console.log("getting address");
    return web3Wrapper.getAvailableAddressesAsync();
  })
);

// this is getting it from the backend, need to make sure it matches metamas
// breaks if switch from local to main
// TODO - revisit later
export const networkId$ = interval(1000).pipe(
  switchMap(() => {
    console.log("getting network");
    return web3Wrapper.getNetworkIdAsync();
  })
);

export const useWeb3 = () => {
  useEffect(() => {
    const userAccountSubscription = userAccount$.subscribe(accountSubject);
    const networkIdSubscriptions = networkId$.subscribe(networkSubject);

    return () => {
      userAccountSubscription.unsubscribe();
      networkIdSubscriptions.unsubscribe();
    };
  }, []);
};

export default web3Wrapper;
export const account$ = accountSubject.asObservable();
export const network$ = networkSubject.asObservable();
