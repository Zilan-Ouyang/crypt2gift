import React, {useState, useEffect, useContext} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import {useTransferAndCall, useCanTrade} from "../hooks/crypt2gift";
import {token2Address} from "../utils/ethers-utils";
import {CRYPT2GIFT_ADDRESS} from "../contracts/data";
import {DappDispatch} from "../Dapp";
import Button from "@material-ui/core/Button";
import {Web3Context} from "../hooks/ethers-hooks";

export default function Deposit ({cryptState}) {
    const web3Context = useContext(Web3Context);
    const dispatch = useContext(DappDispatch);
    const [amount, setAmount] = useState(0);
    const [transferState, transferAndCall] = useTransferAndCall();
    const [tradable, canTrade] = useCanTrade();
    //LISTENER FOR CRYPTO TRANSFERED
    //LISTENER FOR PRICE UP
    useEffect(() => {

    });
    useEffect(() => {
        (async () => {
            await canTrade(token2Address[cryptState.symbolChosen]);
        })();
    }, [canTrade, cryptState.symbol, cryptState.symbolChosen, web3Context.crypt2gift]);
    return(
        <>
            <CssBaseline>
                <h3>Trade {cryptState.symbolChosen} for Gift cards:</h3>
                <p>You own {cryptState.tokenBalance} {cryptState.symbolChosen}</p>
                {cryptState.depositBalance > 0 &&
                    <>
                        <p>You have deposited {cryptState.depositBalance}  {cryptState.symbolChosen} already <Button variant="contained" color="primary" type="button" onClick={() => {
                            dispatch({type: "SET_STEP", step: 3});
                        }}>Claim gift card</Button></p>
                        <p>Or deposit more</p>
                    </>
                }
                <form onSubmit={ event => {
                    transferAndCall(CRYPT2GIFT_ADDRESS, amount, "wesh gros");
                    dispatch({type: "SET_DEPOSIT_STATUS", depositStatus: `Transfering ${amount} ${cryptState.symbolChosen}`});
                    event.preventDefault();
                }}>
                    <input type={"text"} placeholder={"0.00"} value={amount} onChange={event => setAmount(event.target.value)} /><span> {cryptState.symbol} </span>
                    <Button variant="contained" color="primary" type="submit" disabled={!(tradable.response)}>deposit</Button>
                </form>
                {cryptState.depositStatus && <p>{cryptState.depositStatus}</p>}
                {cryptState.priceStatus && <p>{cryptState.priceStatus}</p>}
                {cryptState.canClaim  &&
                <Button variant="contained" color="primary" type="button" onClick={() => {
                    dispatch({type: "SET_STEP", step: 3});
                }}>Claim your gift card</Button>
                }
            </CssBaseline>
        </>
    );
};