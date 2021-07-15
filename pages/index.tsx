import { AccountsTable } from "components/AccountsTable";
import { Navbar } from "components/Navbar";
import { useAccountContext } from "lib/useAccountContext";
import Head from "next/head";
import React, { HTMLAttributes } from "react";

export default function Home() {
  const { accounts } = useAccountContext();

  return (
    <>
      <Head>
        <title>Apple Liquidator | Apple Finance Liquidation Tool</title>
      </Head>

      <Navbar />
      <main>
        <div className="max-w-7xl mx-auto px-2 lg:px-8 pb-12">
          <div className="max-w-7xl mx-auto text-center pt-4">
            <WelcomeMessage
              className="text-xl mt-36 mb-12"
              account={accounts[0]}
            />
            {!accounts.length ? null : (
              <div className="w-full bg-white border-2 border-amber-50 flex flex-col rounded-2xl overflow-auto px-0 lg:px-8 py-8">
                <AccountsTable />
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className=""></footer>
    </>
  );
}

const WelcomeMessage = ({
  account = "",
  ...props
}: HTMLAttributes<HTMLElement> & { account: string }) => {
  return (
    <>
      {account.length ? null : (
        <div {...props}>
          Connect MetaMask to Polygon Network to get started.
        </div>
      )}
    </>
  );
};
