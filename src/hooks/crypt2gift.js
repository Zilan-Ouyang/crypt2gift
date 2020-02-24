import React, {useEffect, useReducer, useContext, useCallback} from 'react';
import {useEthers, Web3Context} from "./ethers-hooks";
import {ethers} from "ethers";
import {linkToBigNumber, bigNumberToLink, token2Address} from "../utils/ethers-utils";

export const CryptContext = React.createContext(null);
export const Crypt2GiftProvider = ({children}) => {
    const [state, dispatch] = useCrypt2Gift();
    return(
        <>
            <CryptContext.Provider value={dispatch}>
                {children}
            </CryptContext.Provider>
        </>
    );
};

const c2gReducer = (state, action) => {
  switch(action.type) {
      case "SET_STEP": //used
          return {...state, step: action.step};
      case "SET_SYMBOL": //used
          return {...state, symbol: action.symbol};
      case "SET_SYMBOL_CHOSEN":
          return {...state, symbolChosen: action.symbolChosen};
      case "SET_FEE": //used
          return {...state, fee: action.fee};
      case "SET_DATE": //used
          return {...state, date: action.date};
      case "SET_PRICE":
          return {...state, price: action.price};
      case "SET_CAN_TRADE":
          return {...state, canTrade: action.canTrade};
      case "SET_DEPOSIT_STATUS":
          return {...state, depositStatus: action.depositStatus};
      case "SET_PRICE_STATUS":
          return {...state, priceStatus: action.priceStatus};
      case "SET_PRICE_UP":
          return {...state, isPriceUp: action.isPriceUp};
      case "SET_CAN_CLAIM":
          return {...state, canClaim: action.canClaim};
      case "SET_REWARD_READY":
          return {...state, isRewardReady: action.isRewardReady};
      case "SET_TOKEN_BALANCE": //used
          return {...state, tokenBalance: action.tokenBalance};
      case "SET_DEPOSIT_BALANCE": //used
          return {...state, depositBalance: action.depositBalance};
      default:
          throw new Error("Action not handled in c2gReducer, bad dispatch!");
  }
};

const initialAppState = {
    step: 1,
    symbol : "",
    canTrade: false,
    canClaim: false,
    isPriceUp: false,
    isRewardReady: false,
    tokenBalance: 0
};
export const useCrypt2Gift = () => {
    const [state, dispatch] = useReducer(c2gReducer, initialAppState);
    const web3Context = useContext(Web3Context);
    useEffect(() => {
        (async () => {
            if(web3Context.crypt2gift) {
                let deposit = await web3Context.crypt2gift.getDepositInfo();
                dispatch({type: "SET_SYMBOL", symbol: deposit.symbol});
                if(deposit.symbol.length > 0) dispatch({type: "SET_SYMBOL_CHOSEN", symbolChosen: deposit.symbol});
                dispatch({type: "SET_DEPOSIT_BALANCE", depositBalance: Number(bigNumberToLink(deposit.amount))});
                dispatch({type: "SET_FEE", fee: Number(bigNumberToLink(deposit.fee))});
                dispatch({type: "SET_DATE", date: Number(bigNumberToLink(deposit.date))});
            }
        })();
    }, [web3Context.crypt2gift, state.step]);
    useEffect(() => {
        if(web3Context.crypt2gift) {
            (async () => {
                if (web3Context.crypt2gift && state.step === 2 && state.symbolChosen.length > 0) {
                    let balance = await web3Context.crypt2gift.balanceOf(token2Address[state.symbolChosen]);
                    dispatch({type: "SET_TOKEN_BALANCE", tokenBalance: Number(bigNumberToLink(balance))});
                }
            })();
        }
    }, [state.step, web3Context.crypt2gift, web3Context.address, web3Context.network, state.symbol, state.symbolChosen]);
    useEffect(() => {
       if(web3Context.crypt2gift && state.step === 3) {
           (async () => {
              let lastPrice = await web3Context.crypt2gift.getLastPriceOf(token2Address[state.symbolChosen]);
              let price = lastPrice.toNumber() / 100;
              dispatch({type: "SET_PRICE", price: price});
           })();
       }
    }, [web3Context.crypt2gift, state.step, state.symbolChosen]);
    useEffect(() => {
        if(web3Context.crypt2gift) {
            if (web3Context.crypt2gift && state.symbolChosen) {
                const filter =
                    web3Context.crypt2gift.filters.TokenTransfered(web3Context.address, token2Address[state.symbolChosen], null, null);
                const onTokenTransfered = (address, ercAddress, amount, date) => {
                    console.log("MONEY RECEIVED");
                    dispatch({
                        type: "SET_DEPOSIT_STATUS",
                        depositStatus: `${bigNumberToLink(amount)} ${state.symbolChosen} transfered to smart contract at ${new Date(date.toNumber())}`
                    })
                    dispatch({type: "SET_PRICE_STATUS", priceStatus: `Checking price of ${state.symbolChosen}`});

                };
                web3Context.crypt2gift.on(filter, onTokenTransfered);
                return () => {
                    web3Context.crypt2gift.removeListener(filter, onTokenTransfered);
                }

            }
        }
    }, [state.symbolChosen, state.symbol, web3Context.crypt2gift, web3Context.address]);
    useEffect(() => {
        if(web3Context.crypt2gift && state.symbolChosen) {
            const filter = web3Context.crypt2gift.filters.PriceUp(state.symbolChosen, null);
            const onPriceUp = (symbol, price) => {
                dispatch({type: "SET_PRICE", price: price.toNumber() / 100});
                dispatch({type: "SET_PRICE_STATUS", priceStatus: `The price of 1 ${state.symbolChosen} is $${price.toNumber() / 100}`});
                dispatch({type: "SET_CAN_CLAIM", canClaim: true});
            };
            web3Context.crypt2gift.on(filter, onPriceUp);
            return () => {
                console.log("REMOVING PRICEUP LISTENER");
                web3Context.crypt2gift.removeListener(filter, onPriceUp);
            }
        }
        }, [web3Context.crypt2gift, state.symbolChosen, state.symbol]);

    return [state, dispatch];
};


const ethersCallReducer = (state, action) => {
    switch(action.type) {
        case "success":
            return {...state, success: true, loading: false, error: false, response: action.response};
        case "loading":
            return {...state, success: false, loading: true, error: false};
        case "error":
            return {...state, success: false, loading: false, error: true, response: action.response};
        default:
            throw new Error(`${action.type} not handled in contractReducer`);
    }
};

const initialState = {
    success: false,
    loading: false,
    error: false,
    response: null
};

export const useCanTrade = () => {
    const [state, dispatch] = useReducer(ethersCallReducer, initialState);
    const web3Context = useContext(Web3Context);
    const canTrade = useCallback(async (ercAddress) => {
        dispatch({type: "loading"});
        try {
            let result =  await web3Context.crypt2gift.canTrade(ercAddress);
            dispatch({type: "success", response: result});
        } catch (e) {
            dispatch({type: "error", response: e})
        }

    }, [web3Context.crypt2gift]);
    return [state, canTrade];
};

export const useGetDepositInfo = () => {
  const [state, dispatch] = useReducer(ethersCallReducer, initialState);
  const web3Context = useContext(Web3Context);
  const getDepositInfo = useCallback(async () => {
      dispatch({type: "loading"});
      try {
          let result = await web3Context.crypt2gift.getDepositInfo();
          result.amount = bigNumberToLink(result.amount);
          result.fee = bigNumberToLink(result.fee);
          result.date = bigNumberToLink(result.date);
          console.log(result);
          dispatch({type: "success", response: result});

      } catch (e) {
          dispatch({type: "error", response: e})
      }

  }, [web3Context.crypt2gift]);
  return [state, getDepositInfo];
};

export const useBalanceOf = () => {
    const [state, dispatch] = useReducer(ethersCallReducer, initialState);
    const web3Context = useContext(Web3Context);
    const balanceOf = useCallback(async (tokenAddress) => {
        dispatch({type: "loading"});
        try {
            let result = await web3Context.crypt2gift.balanceOf(tokenAddress);
            dispatch({type: "success", response: bigNumberToLink(result)});
        } catch (e) {
            dispatch({type: "error", response: e})
        }
        }, [web3Context.crypt2gift]);
    return [state, balanceOf]
};

export const useDepositBalance = () => {
    const [state, dispatch] = useReducer(ethersCallReducer, initialState);
    const web3Context = useContext(Web3Context);
    const depositBalance = useCallback(async () => {
        dispatch({type: "loading"});
        try {
            let result = await web3Context.crypt2gift.depositBalance();
            dispatch({type: "success", response: bigNumberToLink(result)});
        } catch (e) {
            dispatch({type: "error", response: e})
        }
    }, [web3Context.crypt2gift]);
    return [state, depositBalance]
};


export const useClaimGift = () => {
    const [state, dispatch] = useReducer(ethersCallReducer, initialState);
    const web3Context = useContext(Web3Context);
    const claimGift = useCallback(async (email, brand) => {
        dispatch({type: "loading"});
        try {
            let result = await web3Context.crypt2gift.claimGift(email, brand);
            dispatch({type: "success", response: result});
        }catch(e) {
            dispatch({type: "error", response: e});
        }
    }, [web3Context.crypt2gift, web3Context.linktoken]);
    return [state, claimGift];
};

export const useTransferAndCall = () => {
    console.log('calling')
    const [state, dispatch] = useReducer(ethersCallReducer, initialState);
    const web3Context = useContext(Web3Context);
    const transferAndCall = useCallback(async (address, value, data) => {
        data = ethers.utils.formatBytes32String(data);
        value = linkToBigNumber(value);
        dispatch({type: "loading"});
        console.log(web3Context)
        try {
            let result = await web3Context.linktoken.transferAndCall(address, value, data);
            console.log('result')
            dispatch({type: "success", response: result});
        }catch(e) {
            console.log(e)
            dispatch({type: "error", response: e});
        }
    }, [web3Context.crypt2gift, web3Context.linktoken]);
    return [state, transferAndCall];
};

export const useCurrentPrice = () => {
    const [state, dispatch] = useReducer(ethersCallReducer, initialState);
    const web3Context = useContext(Web3Context);
    const currentPrice = useCallback(async (tokenId) => {
        dispatch({type: "loading"});
        try {
            let result = await web3Context.crypt2gift.currentPrice(tokenId);
            dispatch({type: "success", response: result.toNumber() / 100});
        }catch(e) {
            dispatch({type: "error", response: e});
        }
    }, [web3Context.crypt2gift]);
    return [state, currentPrice];
};



/*
//funcName is a function name in the solidity file
export const useCrypt2Gift = () => {
    const web3Context = useContext(Web3Context);
    const [state, dispatch] = useReducer(crypt2GiftReducer, initialState);
    const balanceOf = useCallback(async (funcName, params) => {
        if(web3Context.signer) {
                const response = await web3Context.signer.functions[funcName](...params);
                dispatch({type:"SUCCESS", result: result});
        }
        }, [web3Context.signer]);
    });
    return [state];
};*/