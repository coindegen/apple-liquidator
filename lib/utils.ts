import { Ethereumish } from "ethereum";
import { POLYGON_CHAIN_ID } from "./constants/addresses";
import { Pup } from "types/web3-v1-contracts/pup";
import Web3 from "web3";

export const getAccounts = async (ethereum: Ethereumish) => {
  return ethereum.request!({
    method: "eth_accounts",
  });
};

export const getSelectedAddress = async (ethereum: Ethereumish) => {
  const addressArray: string[] = await getAccounts(ethereum);
  return addressArray[0];
};

export const checkIfPolygon = async (ethereum: Ethereumish) => {
  const chainID = await ethereum.request!({ method: "eth_chainId" });
  return chainID === POLYGON_CHAIN_ID;
};

export const formatAmountToWei = (amount: string, decimal: string) => {
  const bigNumber = (+amount * Math.pow(10, +decimal)).toString();
  const arr = bigNumber.split("e");
  if (arr[1]) {
    return Web3.utils.toBN(arr[0]).pow(Web3.utils.toBN(arr[1].slice(1)));
  }
  return bigNumber;
};

export const formatAmountFromWei = (amountRaw: string, decimal: string) => {
  return (+amountRaw / Math.pow(10, +decimal)).toFixed(2);
};

export const isEmptyObject = (obj: any) => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

export const formatNumber = (num: number) => {
  if (num < 1) {
    return getSignificantDigits(num);
  }

  if (num < 1000) {
    return Number(num.toFixed(2)).toLocaleString();
  }
  return Math.round(Number(num)).toLocaleString();
};

export const convertToPercent = (amount: number) => (amount * 100).toFixed(2);

export const getSignificantDigits = (balance: number) => {
  const getDecPosition = (balance: number) => {
    const [_coeff, exponent] = balance.toExponential().split("e").map(Number);

    const result = balance.toFixed(Math.abs(exponent) + 1);
    return result;
  };

  if (balance === 0) {
    return balance;
  }

  return balance < 0.01 ? getDecPosition(balance) : balance.toFixed(4);
};

export const makeObjectFromArray = (
  acc: Record<string, { liquidity: string; shortfall: string }>,
  [k, v]: [string, { liquidity: string; shortfall: string }]
) => {
  acc[k] = v;
  return acc;
};
