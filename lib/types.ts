export interface ITokenData {
  asset: string;
  decimals: string;
  symbol: string;
  lendBalance: string;
  lendBalanceFormatted: string;
  lendValueUnderlying: string;
  lendValueUsd: string;
  borrowBalance: string;
  borrowBalanceFormatted: string;
  borrowValueUnderlying: string;
  borrowValueUsd: string;
}

export interface IWalletInfo {
  tokenBalances: ITokenData[];
  status: { liquidity: string; shortfall: string };
}

export type TokenDictionary = Record<
  string,
  {
    symbol: string;
    name: string;
    decimals: string;
    underlying: string;
    exchangeRateStored: string;
  }
>;
