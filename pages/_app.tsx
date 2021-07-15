import Head from "next/head";
import { AccountContextProvider } from "lib/useAccountContext";
import {
  AppInitialProps,
  NextComponentType,
} from "next/dist/next-server/lib/utils";

import "../styles/globals.css";

type NextComponentTypeWithLayout = NextComponentType & {
  Layout?: React.ComponentType;
};

function MyApp({
  Component,
  pageProps,
}: AppInitialProps & { Component: NextComponentTypeWithLayout }) {
  return (
    <>
      <Head>
        <meta name="description" content="Apple Finance Liquidation Tool" />
        <link rel="shortcut icon" href="/images/logo-apple-liquidator.png" />
        <link
          rel="icon"
          type="image/png"
          href="/images/logo-apple-liquidator.png"
          sizes="16x16"
        />
        <link
          rel="icon"
          type="image/png"
          href="/images/logo-apple-liquidator.png"
          sizes="32x32"
        />
      </Head>
      <AccountContextProvider>
        <Component {...pageProps} />
      </AccountContextProvider>
    </>
  );
}

export default MyApp;
