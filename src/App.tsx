import React, {
  Component,
  useContext,
  useEffect,
  useState,
  FunctionComponent
} from "react";
import logo from "./logo.svg";
import "./App.css";
import { Web3Context } from "./Web3Context";

type HeaderProps = {};

const Header: FunctionComponent<HeaderProps> = () => {
  const web3 = useContext(Web3Context);
  const [userAddress, setUserAddress] = useState("");

  const getUserAddress = async () => {
    const [
      userAddress,
      ...otherAddresses
    ] = await web3.getAvailableAddressesAsync();

    setUserAddress(userAddress);
  };

  useEffect(() => {
    const intervalId = setInterval(getUserAddress, 1000);
    return () => clearInterval(intervalId);
  });

  return (
    <div style={{ background: "gray", width: "100%", height: "20px" }}>
      <span>{userAddress && `Account: ${userAddress}`}</span>
    </div>
  );
};

type AppProps = {};

const App: FunctionComponent<AppProps> = ({}) => {
  return (
    <div>
      <Header />
    </div>
  );
};

export default App;
