import React, {useState} from 'react';
import {Web3Provider} from "./hooks/ethers-hooks";
import Dapp from "./Dapp";
import './App.css';

function App() {
  return (
      <>
        <Web3Provider>
              <Dapp />
        </Web3Provider>
      </>
  );
}


export default App;
