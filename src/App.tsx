import React, { FunctionComponent, useEffect } from "react";
import "./App.css";
import {
  useEthereumAccount,
  useAcceptedNetworkId,
  useOwnBalanceOf,
  allowedTokens
} from "./web3Hooks";
import { useWeb3 } from "./setupWeb3";

// for colors https://colorhunt.co/palette/42191

type HeaderProps = {};

const Header: FunctionComponent<HeaderProps> = () => {
  const userAddress = useEthereumAccount();

  return (
    <div
      style={{
        background: "#71c9ce",
        height: "2rem",
        display: "flex",
        "justify-content": "flex-end",
        "align-items": "flex-end",
        color: "#e3fdfd",
        padding: "1rem"
      }}
    >
      <span>
        {userAddress &&
          `Account ending in: ${userAddress.slice(userAddress.length - 4)}`}
      </span>
    </div>
  );
};

type BalanceDisplayProps = {};

const BalanceDisplay: FunctionComponent<BalanceDisplayProps> = () => {
  const zrxBalance = useOwnBalanceOf(allowedTokens.Zrx);
  const ethBalance = useOwnBalanceOf(allowedTokens.Eth);
  const wethBalance = useOwnBalanceOf(allowedTokens.Weth);

  return (
    <div style={{}}>
      Balances
      <div>ZRX: {zrxBalance}</div>
      <div>ETH: {ethBalance}</div>
      <div>WETH: {wethBalance}</div>
    </div>
  );
};

type AppProps = {};

//TODO: add error boundary in to catch the network switch error - refresh if that happens?

const App: FunctionComponent<AppProps> = ({}) => {
  useWeb3();
  const isAcceptedNetwork = useAcceptedNetworkId([50]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#e3fdfd",
        "box-sizing": "border-box"
      }}
    >
      <Header />
      {isAcceptedNetwork && <BalanceDisplay />}
    </div>
  );
};

export default App;
