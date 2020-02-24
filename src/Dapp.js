import React, {useState} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import PrimarySearchAppBar from "./components/layout";
import {Crypt2GiftProvider, useCrypt2Gift} from "./hooks/crypt2gift";
import Currency from "./components/CurrencyForm";
import Deposit from "./components/DepositForm";
import Gift from "./components/GiftForm"

export const DappDispatch = React.createContext(null);


export default function Dapp () {
    const [state, dispatch] = useCrypt2Gift();
    return(
      <>
        <DappDispatch.Provider value={dispatch}>
            <CssBaseline>
              <PrimarySearchAppBar/>
                {state.step === 1 && <Currency cryptState={state} />}
                {state.step === 2 && <Deposit cryptState={state} />}
                {state.step === 3 && <Gift cryptState={state} />}
            </CssBaseline>
        </DappDispatch.Provider>
      </>
    );
};