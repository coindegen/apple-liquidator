// import { IToken } from "lib/types";
import { useAccountContext } from "lib/useAccountContext";
import { formatAmountFromWei } from "lib/utils";
import { useEffect, useState } from "react";
import { Pup } from "types/web3-v1-contracts/pup";
import Web3 from "web3";
const abi = require("human-standard-token-abi");

export type BalanceStatus =
  | BalanceStatusEnum.Complete
  | BalanceStatusEnum.Pending
  | BalanceStatusEnum.Idle;

export enum BalanceStatusEnum {
  Complete = "complete",
  Idle = "idle",
  Pending = "pending",
}
export interface BalanceData {
  balance: number;
  status: BalanceStatus;
}

export const useGetTokenBalance: (
  token: any | null
) => BalanceData | undefined = (token) => {
  const [balance, setBalance] = useState<number>(0);
  const [status, setStatus] = useState<BalanceStatus>(BalanceStatusEnum.Idle);
  const { accounts } = useAccountContext();

  try {
    useEffect(() => {
      const getTheBalance = async () => {
        if (!token) {
          console.error("No token address supplied");
          return;
        }
        setStatus(BalanceStatusEnum.Pending);

        const web3 = new Web3(Web3.givenProvider);

        const tokenContract = new web3.eth.Contract(
          abi,
          token.address
        ) as any as Pup;

        const balanceRaw = await tokenContract.methods
          .balanceOf(accounts[0])
          .call();

        if (Number(balanceRaw) <= 0) {
          setStatus(BalanceStatusEnum.Complete);
          return setBalance(0);
        }

        const balanceAdjusted = formatAmountFromWei(balanceRaw, token.decimal);

        setStatus(BalanceStatusEnum.Complete);
        if (balanceAdjusted) {
          setBalance(+balanceAdjusted);
        }
      };

      if (token) {
        getTheBalance();
      }
    }, [token, accounts]);

    return { balance, status };
  } catch (error) {
    console.error(error);
  }
};
