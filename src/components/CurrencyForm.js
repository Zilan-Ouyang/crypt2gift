import React, {useContext, useEffect, useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import {CryptContext, useCrypt2Gift, useGetDepositInfo} from "../hooks/crypt2gift";
import {Web3Context} from "../hooks/ethers-hooks";
import {TokenGridList} from "./GridList";
import {bigNumberToLink} from "../utils/ethers-utils";
import {DappDispatch} from "../Dapp";

const useStyles = makeStyles(theme => ({
    button: {
        display: 'block',
        marginTop: theme.spacing(2),
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
}));


export default function Currency ({cryptState}) {
  const dispatch = useContext(DappDispatch);
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [currency, setCurrency] = useState("");
  function handleChange(event) {
      setCurrency(event.target.value);
      dispatch({type: "SET_SYMBOL_CHOSEN", symbolChosen: event.target.value});
      dispatch({type: "SET_STEP", step: 2});
  }
  function handleClose() {
      setOpen(false);
  }
  function handleOpen() {
      setOpen(true);
  }
  if(cryptState.depositBalance > 0) {
      return(
          <>
              {cryptState.step}
              <p>You already deposited {cryptState.depositBalance} {cryptState.symbol}</p>
              <p>Please Claim your gift or Deposit more </p>
              <Button variant="contained" color="primary" type="button" onClick={() => {
                  dispatch({type: "SET_STEP", step: 2});
              }}>deposit more</Button>
              <Button variant="contained" color="primary" type="button" onClick={() => {
                  dispatch({type: "SET_STEP", step: 3});
              }}>Claim gift card</Button>
          </>
        );
  }
  return(
    <>
        <h2>Trade your crypto for gift cards:</h2>
        <form autoComplete="off">
            <Button className={classes.button} onClick={handleOpen}>
                Choose a Token you want to trade for gift cards:
            </Button>
            <FormControl className={classes.formControl}>
                <InputLabel htmlFor="select-currency">Token</InputLabel>
                <Select
                    open={open}
                    onClose={handleClose}
                    onOpen={handleOpen}
                    value={currency}
                    onChange={handleChange}
                    inputProps={{
                        name: 'currency',
                        id: 'select-currency',
                    }}>
                    <MenuItem value={"LINK"}>LINK</MenuItem>
                    <MenuItem value={"MOAB"}>MOAB</MenuItem>
                    <MenuItem value={"BNB"}>BNB</MenuItem>
                </Select>
            </FormControl>
        </form>
        <TokenGridList/>
    </>
  );
};
