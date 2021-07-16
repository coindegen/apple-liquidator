const fs = require("fs");
const Web3 = require("web3");
const rpcAddress =
  "https://rpc-mainnet.maticvigil.com/v1/9239d280acc587a55ebd6286a30b05506620700b";

const web3 = new Web3(new Web3.providers.HttpProvider(rpcAddress));
const tokenABI = require("./lib/abis/IAToken.json");

const aMatic = "0x2840AF6f287d329237c8addc5500C349E041C5BB"; // change aToken address if not matic
const tokens = require("./lib/constants/tokens.json");

type TokenDictionary = Record<
  string,
  {
    symbol: string;
    name: string;
    decimals: string;
    underlying?: string | null;
    exchangeRateStored: string;
  }
>;

const getTokenData = async (key: string, isUnderlying: boolean = false) => {
  const tokenContract = new web3.eth.Contract(tokenABI, key);

  const symbol = await tokenContract.methods.symbol().call();
  const decimals = await tokenContract.methods.decimals().call();
  const name = await tokenContract.methods.name().call();

  console.log({ symbol });
  console.log({ isUnderlying });

  let underlying = undefined;
  let exchangeRateStored = undefined;

  if (!isUnderlying) {
    console.log("i'm in here");
    underlying = await tokenContract.methods.underlying().call();
    exchangeRateStored = await tokenContract.methods
      .exchangeRateStored()
      .call();
  }

  const tokenData = {
    symbol,
    name,
    decimals,
    underlying,
    exchangeRateStored,
  };
  return tokenData;
};

const main = async () => {
  let appleTokensTable: TokenDictionary = {};

  for (const [key, val] of Object.entries(tokens).slice(5)) {
    const currentToken = await getTokenData(key);
    console.log("underlying", currentToken.underlying);

    const underlyingToken = await getTokenData(currentToken.underlying, true);

    appleTokensTable[key] = currentToken;
    appleTokensTable[currentToken.underlying] = underlyingToken;
  }

  console.log({ appleTokensTable });
  fs.writeFileSync(
    `tokensTable.json`,
    JSON.stringify(appleTokensTable, null, 2)
  );
};

main();

// (async function getTokenInfo() {
//   try {
//     const aMatic = "0x2840AF6f287d329237c8addc5500C349E041C5BB"; // change aToken address if not matic

//     const web3 = new Web3("https://rpc-mainnet.matic.network");
//     const comptrollerABI = require("./lib/abis/IAToken.json");

//     const tokenContract = new web3.eth.Contract(abi, aMatic);
//     const exchangeRateStored = await tokenContract.methods
//       .exchangeRateStored()
//       .call();

//     console.log({ exchangeRateStored });
//   } catch (e) {}
// })();

// export const noop = () => {};
