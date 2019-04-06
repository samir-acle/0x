import React, { FunctionComponent } from "react";
import "./App.css";
import { useEthereumAccount } from "./web3Hooks";

type HeaderProps = {};

// for colors https://colorhunt.co/palette/42191

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

type AppProps = {};

const App: FunctionComponent<AppProps> = ({}) => {
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
    </div>
  );
};

export default App;
