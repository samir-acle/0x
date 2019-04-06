import React, { useContext, useEffect, useState } from "react";
import { Web3Context } from "./Web3Context";
import { account$ } from "./setupWeb3";

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
