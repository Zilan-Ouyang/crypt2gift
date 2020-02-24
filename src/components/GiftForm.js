import React, {useContext, useEffect, useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import {
    useTransferAndCall,
    useBalanceOf,
    CryptContext,
    useDepositBalance,
    useClaimGift
} from "../hooks/crypt2gift";
import {Web3Context} from "../hooks/ethers-hooks";
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


export default function Gift ({cryptState}) {
    const dispatch = useContext(DappDispatch);
    const web3Context = useContext(Web3Context);
    const classes = useStyles();
    const [brand, setBrand] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [response, claimGift] = useClaimGift();
    const [email, setEmail] = useState("");

    function handleChange(event) {
        setBrand(event.target.value);
        console.log(`The brand is ${event.target.value}`);
    }

    function handleClose() {
        setOpen(false);
    }

    function handleOpen() {
        setOpen(true);
    }
    if(cryptState) {
    return(
        <>
            <p>Current price for {cryptState.symbol} ${cryptState.price}</p>
            <p>You have deposisted {cryptState.depositBalance} {cryptState.symbol}</p>
            {cryptState.depositBalance > 0 &&
                <div>
                <p>You can claim for ${cryptState.depositBalance * cryptState.price} of gift cards</p>
            <form autoComplete="off">
                <Button className={classes.button} onClick={handleOpen}>
                Choose a brand for your gift card:
                </Button>
                <FormControl className={classes.formControl}>
                <InputLabel htmlFor="select-brand">Brand</InputLabel>
                <Select
                open={open}
                onClose={handleClose}
                onOpen={handleOpen}
                value={brand}
                onChange={handleChange}
                inputProps={{
                name: 'brand',
                id: 'select-brand',
                }}
                >
                <MenuItem value={"amazonus"}>Amazon</MenuItem>
                <MenuItem value={"itunesus"}>Itunes</MenuItem>
                <MenuItem value={"walmart"}>Walmart</MenuItem>
                    <MenuItem value={"gap"}>Gap</MenuItem>
                    <MenuItem value={"nike"}>Nike</MenuItem>

                </Select>
                </FormControl>
                </form>
                </div>

            }
            {brand.length > 0 &&
                <div>
            email: <input placeHolder={"your email"} onChange={(event) => setEmail(event.target.value)} />
            <Button variant="contained" color="primary" onClick={async () => await claimGift(email, brand)}>claim gift card</Button>
                </div>
            }
        </>
    );}
    return(
        <p>LOADING</p>
    );

};