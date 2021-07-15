import { Navbar } from "components/Navbar";
import { useAccountContext } from "lib/useAccountContext";
import { formatAmountFromWei } from "lib/utils";
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
import { ExternalLinkIcon } from "@heroicons/react/outline";
import { LoadingSpinner } from "components/icons/LoadingSpinner";

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
          <div className="max-w-7xl mx-auto text-center pt-4">
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
interface ITokenData {
  asset: string;
  decimals: string;
  symbol: string;
  lendBalance: string;
  lendBalanceFormatted: string;
  borrowBalance: string;
  borrowBalanceFormatted: string;
}

const getTokenBalanceByAccount: (
  payload: IGetTokenBalance
) => Promise<ITokenData | null> = async ({ account, asset, web3 }) => {
  const tokenAbi: AbiItem[] = require("lib/abis/IAToken.json");

  const tokenContract = new web3.eth.Contract(
    tokenAbi,
    asset
  ) as any as IAToken;

  // const balance = await tokenContract.methods.balanceOf(account).call();

  //  * @return (possible error, token balance, borrow balance, exchange rate mantissa)
  const accountSnapshot = await tokenContract.methods
    .getAccountSnapshot(account)
    .call();

  // console.log({
  //   token: `${appleTokens[asset.toLowerCase()]}`,
  //   accountSnapshot,
  // });

  const lendBalance = accountSnapshot[1];
  const borrowBalance = accountSnapshot[2];

  if (+lendBalance <= 0 && +borrowBalance <= 0) {
    return null;
  }

  const decimals = await tokenContract.methods.decimals().call();

  const lendBalanceFormatted = formatAmountFromWei(lendBalance, decimals);
  const borrowBalanceFormatted = formatAmountFromWei(borrowBalance, decimals);

  const symbol = await tokenContract.methods.symbol().call();

  return {
    asset,
    symbol,
    decimals,
    lendBalance,
    lendBalanceFormatted,
    borrowBalance,
    borrowBalanceFormatted,
  };
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

interface IWalletInfo {
  tokenBalances: ITokenData[];
  status: { liquidity: string; shortfall: string };
}

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
      <div className="w-full bg-gray-50 border-2 border-amber-50 flex rounded-2xl overflow-auto p-6 lg:p-12 ">
        <div className="">
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
              <BalanceData walletInfo={walletInfo} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const BalanceData: FC<{ walletInfo: IWalletInfo }> = ({ walletInfo }) => {
  return (
    <div className="mt-8 lg:mt-20">
      <div className="grid grid-cols-3 text-right mb-10 space-y-1">
        <Fragment>
          <div className="font-semibold text-left">Status</div>
          <div className="font-semibold text-right">Amount (wei)</div>
          <div className="font-semibold text-right">Amount</div>
        </Fragment>
        <Fragment>
          <div className="text-left">Liquidity</div>
          <div className="text-right font-mono">
            {walletInfo.status.liquidity}
          </div>
          <div className="text-right font-mono">
            {Web3.utils.fromWei(walletInfo.status.liquidity)}
          </div>
        </Fragment>
        <Fragment>
          <div className="text-left">Shortfall</div>
          <div className="text-right font-mono">
            {walletInfo.status.shortfall}
          </div>
          <div className="text-right font-mono">
            {Number(Web3.utils.fromWei(walletInfo.status.shortfall)).toFixed(2)}
          </div>
        </Fragment>
      </div>
      <div className="grid grid-cols-3 text-right space-y-1">
        <Fragment>
          <div className="font-semibold text-left">Lent Tokens</div>
          <div className="font-semibold text-right">Balance (wei)</div>
          <div className="font-semibold text-right">Balance</div>
        </Fragment>

        {walletInfo.tokenBalances.map((tokenData) => {
          return (
            <Fragment key={tokenData.symbol}>
              <div className="text-left">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View on block explorer"
                  className="hover:text-amber-600 underline hover:no-underline"
                  href={`https://polygonscan.com/address/${tokenData.asset}`}
                >
                  {tokenData.symbol}
                </a>
              </div>
              <div className="text-right font-mono">
                {tokenData.lendBalance}
              </div>
              <div className="text-right font-mono">
                {tokenData.lendBalanceFormatted}
              </div>
            </Fragment>
          );
        })}
      </div>

      <div className="grid grid-cols-3 text-right mt-10 space-y-1">
        <Fragment>
          <div className="font-semibold text-left">Borrowed Tokens</div>
          <div className="font-semibold text-right">Borrow Balance (wei)</div>
          <div className="font-semibold text-right">Borrow Balance</div>
        </Fragment>

        {walletInfo.tokenBalances.map((tokenData) => {
          return (
            <Fragment key={tokenData.symbol}>
              <div className="text-left">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View on block explorer"
                  className="hover:text-amber-600 underline hover:no-underline"
                  href={`https://polygonscan.com/address/${tokenData.asset}`}
                >
                  {tokenData.symbol}
                </a>
              </div>
              <div className="text-right font-mono ">
                {tokenData.borrowBalance}
              </div>
              <div className="text-right font-mono">
                {tokenData.borrowBalanceFormatted}
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};
