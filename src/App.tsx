import React, { FunctionComponent } from "react";
import "./App.css";
import { useEthereumAccount } from "./web3Hooks";

type HeaderProps = {};

const Header: FunctionComponent<HeaderProps> = () => {
  const userAddress = useEthereumAccount();

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
