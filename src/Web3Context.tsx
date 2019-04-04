import React, { FunctionComponent } from "react";
import web3 from "./setupWeb3";

export const Web3Context = React.createContext(web3);

type Web3Props = {};

const Web3: FunctionComponent<Web3Props> = ({ children }) => {
  return <Web3Context.Provider value={web3}>{children}</Web3Context.Provider>;
};

export default Web3;
