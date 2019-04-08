import React, { useContext, useEffect, useState } from "react";
import { Web3Context } from "./Web3Context";
import { account$, network$ } from "./setupWeb3";

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
