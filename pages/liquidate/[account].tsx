import { ExternalLinkIcon } from "@heroicons/react/outline";
import { LoadingSpinner } from "components/icons/LoadingSpinner";
import { Navbar } from "components/Navbar";
import { TokenTable } from "components/TokenTable";
import { ITokenData, IWalletInfo, TokenDictionary } from "lib/types";
import { useAccountContext } from "lib/useAccountContext";
import { formatAmountFromWei, formatNumber } from "lib/utils";
import Head from "next/head";
import { useRouter } from "next/router";
import React, {
  FC,
  Fragment,
  HTMLAttributes,
  useEffect,
  useState,
} from "react";
import { IAToken } from "types/web3-v1-contracts/IAToken";
import { ICompoundComptroller } from "types/web3-v1-contracts/ICompoundComptroller";
import Web3 from "web3";
import { AbiItem } from "web3-utils";

function LiquidateAccount() {
  const { accounts } = useAccountContext();

  const router = useRouter();
  const query = router.query;
  const account = query.account as string;

  if (!account) {
    return <div>Use a valid account in the url</div>;
  }

  if (account && account.length !== 42) {
    return <div>Invalid wallet address</div>;
  }

  return (
    <div className="">
      <Head>
        <title>Apple Liquidator</title>
      </Head>

      <Navbar />
      <main className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="text-center pt-4">
            <WelcomeMessage
              className="text-xl mt-36 mb-12"
              account={accounts[0]}
            />
            {!accounts.length ? null : <AppUI account={account} />}
          </div>
        </div>
      </main>

      <footer className=""></footer>
    </div>
  );
}

export default LiquidateAccount;

const WelcomeMessage = ({
  account = "",
  ...props
}: HTMLAttributes<HTMLElement> & { account: string }) => {
  return (
    <>
      {account.length ? null : (
        <div {...props}>
          Connect MetaMask to Polygon Network to get started.{" "}
        </div>
      )}
    </>
  );
};

const getAssetsByAccount = (
  comptrollerContract: ICompoundComptroller,
  address: string
) => {
  return comptrollerContract.methods.getAssetsIn(address).call();
};

const getLiquidityByAccount = (
  comptrollerContract: ICompoundComptroller,
  address: string
) => {
  return comptrollerContract.methods.getAccountLiquidity(address).call();
};

interface IGetTokenBalance {
  account: string;
  asset: string;
  web3: Web3;
}

interface IGetBalances {
  account: string;
  assets: string[];
  web3: Web3;
}
const tokenDictionary: TokenDictionary = require("lib/constants/tokenDictionary.json");

const getTokenBalanceByAccount: (
  payload: IGetTokenBalance
) => Promise<ITokenData | null> = async ({ account, asset, web3 }) => {
  // console.log({ asset });

  const tokenAbi: AbiItem[] = require("lib/abis/IAToken.json");

  const tokenContract = new web3.eth.Contract(
    tokenAbi,
    asset
  ) as any as IAToken;

  //  * @return (possible error, token balance, borrow balance, exchange rate mantissa)
  const accountSnapshot = await tokenContract.methods
    .getAccountSnapshot(account)
    .call();

  // console.log({ accountSnapshot });

  const lendBalance = accountSnapshot[1];
  const borrowBalance = accountSnapshot[2];

  // console.log({ borrowBalance, lendBalance });

  if (+lendBalance <= 0 && +borrowBalance <= 0) {
    return null;
  }

  const exchangeRateCurrent = await tokenContract.methods
    .exchangeRateCurrent()
    .call();

  // console.log({ exchangeRateCurrent });

  const token = tokenDictionary[asset.toLowerCase()];

  const underlyingToken = tokenDictionary[token.underlying.toLowerCase() || ""];

  // console.log(token);

  const symbol = token.symbol;
  const decimals = token.decimals;

  const getValueUnderlyingRaw = (amount: string, exchangeRate: string) => {
    return +amount * (+exchangeRate / Math.pow(10, 18));
  };

  const lendValueUnderlyingRaw = getValueUnderlyingRaw(
    lendBalance,
    exchangeRateCurrent
  );

  const borrowValueUnderlyingRaw = getValueUnderlyingRaw(
    (+borrowBalance / Math.pow(10, +decimals)).toString(),
    exchangeRateCurrent
  );

  const getValueUnderlyingDecimalAdjusted = (
    amount: number,
    decimals: string
  ) => {
    return (amount / Math.pow(10, +decimals)).toString();
  };

  const lendValueUnderlyingDecimalAdjusted = getValueUnderlyingDecimalAdjusted(
    lendValueUnderlyingRaw,
    underlyingToken.decimals
  );

  const borrowValueUnderlyingDecimalAdjusted =
    getValueUnderlyingDecimalAdjusted(
      borrowValueUnderlyingRaw,
      underlyingToken.decimals
    );

  // console.log({ lendValueUnderlyingDecimalAdjusted });

  const lendValueUnderlying = formatNumber(+lendValueUnderlyingDecimalAdjusted);

  // console.log({ lendValueUnderlying });

  const borrowValueUnderlying = formatNumber(
    +borrowValueUnderlyingDecimalAdjusted
  );

  const lendValueUsd = await getValueUSD(
    token.underlying,
    lendValueUnderlyingRaw,
    lendValueUnderlying
  );

  const borrowValueUsd = await getValueUSD(
    token.underlying,
    borrowValueUnderlyingRaw,
    borrowValueUnderlying
  );

  const lendBalanceFormatted = formatNumber(
    formatAmountFromWei(lendBalance, decimals)
  );

  const borrowBalanceFormatted = formatNumber(
    formatAmountFromWei(borrowBalance, decimals)
  );

  // I think borrow data doesn't actually use 8 decimals
  // const borrowBalanceFormatted = formatNumber(
  //   formatAmountFromWei(borrowBalance, decimals)
  // );

  return {
    asset,
    symbol,
    decimals,
    lendBalance,
    lendBalanceFormatted,
    lendValueUnderlying,
    lendValueUsd,
    borrowBalance,
    borrowBalanceFormatted,
    borrowValueUnderlying,
    borrowValueUsd,
  };
};

const usdcAddress = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";

const getValueUSD: (
  fromTokenAddress: string | null,
  amount: number,
  underlyingAmount: string
) => Promise<string> = async (fromTokenAddress, amount, underlyingAmount) => {
  // console.log({ underlyingAmount });
  // console.log({ amount });

  if (amount === 0) {
    return "0";
  }

  if (!fromTokenAddress) {
    return underlyingAmount;
  }

  if (fromTokenAddress.toLowerCase() === usdcAddress.toLowerCase()) {
    return `$${underlyingAmount}`;
  }

  const convertScientificToString = (amount: number) => {
    return amount.toLocaleString("fullwide", {
      useGrouping: false,
    });
  };

  const isScientific = (amount: number) => {
    const stringArray = amount.toString().split("e");

    if (stringArray[1]) {
      return true;
    }
    return false;
  };

  const amountAsString = isScientific(amount)
    ? convertScientificToString(amount)
    : Math.round(amount).toString();

  // console.log(tokenDictionary[fromTokenAddress].symbol, amountAsString);

  if (+amountAsString <= 0) {
    return "0";
  }

  const fromAddressCorrected =
    fromTokenAddress === "0x0000000000000000000000000000000000001010"
      ? "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"
      : fromTokenAddress;

  const priceOracleEndpoint = `https://api.1inch.exchange/v3.0/137/quote?fromTokenAddress=${fromAddressCorrected}&toTokenAddress=${usdcAddress}&amount=${amountAsString}`;

  const result = await fetch(priceOracleEndpoint);

  // console.log({ result });

  const resBody = await result.json();

  // console.log({ resBody });

  if (resBody.error) {
    return "?";
  }

  return `$${formatNumber(
    resBody.toTokenAmount / Math.pow(10, +tokenDictionary[usdcAddress].decimals)
  )}`;
};

const getAccountBalances = async ({ account, assets, web3 }: IGetBalances) => {
  const tokens = await Promise.all(
    assets.map((asset) => {
      return getTokenBalanceByAccount({ account, asset, web3 });
    })
  );

  const filteredTokens = tokens.filter(Boolean) as ITokenData[];
  return filteredTokens;
};

const AppUI: FC<{ account: string }> = ({ account = "" }) => {
  const [walletInfo, setWalletInfo] = useState<IWalletInfo>({
    status: { liquidity: "0", shortfall: "0" },
    tokenBalances: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLiquidationData() {
      const web3 = new Web3(Web3.givenProvider);

      const comptrollerABI: AbiItem[] = require("lib/abis/ICompoundComptroller.json");

      const comptrollerAddress = "0x46220a07f071d1a821d68fa7c769bccda3c65430";
      const comptrollerContract = new web3.eth.Contract(
        comptrollerABI,
        comptrollerAddress
      ) as any as ICompoundComptroller;

      const assets = await getAssetsByAccount(comptrollerContract, account);

      // console.log({ assets });

      const liquidity = await getLiquidityByAccount(
        comptrollerContract,
        account
      );

      const accountBalances = await getAccountBalances({
        assets,
        web3,
        account,
      });

      setWalletInfo({
        status: { liquidity: liquidity[1], shortfall: liquidity[2] },
        tokenBalances: accountBalances,
      });

      setIsLoading(false);
    }

    try {
      fetchLiquidationData();
    } catch (error) {
      console.error(error);
    }
  }, [account]);

  return (
    <>
      <div className="bg-gray-50 border-2 border-amber-50 flex rounded-2xl overflow-auto p-6 lg:p-12 ">
        <div className="w-full">
          <div className="text-left">
            <h4 className="uppercase tracking-widest">
              <div className="text-gray-500 text-xs">Wallet</div>
            </h4>
            <div className="flex flex-row text-2xl lg:text-2xl mt-2 mb-10 items-center font-sans">
              <a
                className="font-semibold hover:text-amber-600 underline hover:no-underline"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://polygonscan.com/address/${account}`}
              >
                {account}
              </a>
              <div className="text-gray-400 ml-2 w-5 h-5">
                <ExternalLinkIcon />
              </div>
            </div>
            {isLoading ? (
              <div className="flex flex-row items-center">
                <div className="h-4 w-4 mr-2">
                  <LoadingSpinner />
                </div>
                <div>Loading Balances…</div>
              </div>
            ) : (
              <>
                <BalanceData walletInfo={walletInfo} />

                <TokenTable tableId="lend" walletInfo={walletInfo} />
                <TokenTable tableId="borrow" walletInfo={walletInfo} />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const BalanceData: FC<{ walletInfo: IWalletInfo }> = ({ walletInfo }) => {
  return (
    <div className="mt-8 lg:mt-16 px-5 w-1/3">
      <div className="grid grid-cols-2 text-right mb-10 space-y-2">
        <Fragment>
          <div className="font-semibold text-left"></div>
          <div className="font-semibold text-right">Amount (USD)</div>
        </Fragment>
        <Fragment>
          <div className="text-left font-semibold">Liquidity</div>
          <div className="text-right font-mono">
            $
            {Number(
              Number(Web3.utils.fromWei(walletInfo.status.liquidity)).toFixed(2)
            ).toLocaleString()}
          </div>
        </Fragment>
        <Fragment>
          <div className="text-left font-semibold">Shortfall</div>
          <div
            id={walletInfo.status.shortfall}
            className="text-right font-mono"
          >
            $
            {Number(
              Number(Web3.utils.fromWei(walletInfo.status.shortfall)).toFixed(2)
            ).toLocaleString()}
          </div>
        </Fragment>
      </div>
    </div>
  );
};
