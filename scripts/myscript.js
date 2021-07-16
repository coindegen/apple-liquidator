const Web3 = require("web3");
const rpcAddress =
  "https://rpc-mainnet.maticvigil.com/v1/9239d280acc587a55ebd6286a30b05506620700b";

const web3 = new Web3(new Web3.providers.HttpProvider(rpcAddress));
const tokenABI = require("./lib/abis/IAToken.json");

// const aMatic = "0x2840AF6f287d329237c8addc5500C349E041C5BB"; // change aToken address if not matic
const tokens = require("./lib/constants/tokens.json");

const main = async () => {
  let appleTokensTable = {};

  const tokenContract = new web3.eth.Contract(
    tokenABI,
    "0xaaf34d1abe39765356bd28cb348dfdfc612b83cf"
  );

  const symbol = await tokenContract.methods.symbol().call();
  const decimals = await tokenContract.methods.decimals().call();
  const name = await tokenContract.methods.name().call();
  const exchangeRateStored = await tokenContract.methods
    .exchangeRateStored()
    .call();
  //   const underlying = await tokenContract.methods.underlying().call();

  console.log({ name, symbol, decimals });
  console.log({ exchangeRateStored, underlying });

  //   try {
  //     underlying = await tokenContract.methods.underlying().call();
  //   } catch (error) {
  //     console.error(error);
  //   }

  //   for (const [key, val] of Object.entries(tokens).slice(0, 2)) {
  //     console.log(key);
  //     const tokenContract = new web3.eth.Contract(tokenABI, key);

  //     const symbol = await tokenContract.methods.symbol().call();
  //     const decimals = await tokenContract.methods.decimals().call();
  //     const name = await tokenContract.methods.name().call();
  //     const underlying = await tokenContract.methods.underlying().call();
  //     console.log({ underlying });

  //     appleTokensTable[key] = {};

  //     appleTokensTable[key].symbol = symbol;
  //     appleTokensTable[key].name = name;
  //     appleTokensTable[key].decimals = decimals;
  //     appleTokensTable[key].underlying = underlying;

  //     //     const exchangeRateStored = await tokenContract.methods
  //     //       .exchangeRateStored()
  //     //       .call();
  //     //     console.log({ exchangeRateStored });
  //   }

  //   console.log({ appleTokensTable });
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
