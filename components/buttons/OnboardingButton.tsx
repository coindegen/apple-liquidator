import { MetamaskIcon } from "components/icons/Metamask";
import MetaMaskOnboarding from "@metamask/onboarding";
import { useAccountContext } from "lib/useAccountContext";
import { useRef, useState, useEffect } from "react";
import Web3 from "web3";
import { ProviderRpcError } from "hardhat/types";
import { checkIfPolygon, getAccounts } from "lib/utils";

const web3 = new Web3(Web3.givenProvider);

type Status =
  | Statuses.Connected
  | Statuses.Pending
  | Statuses.Disconnected
  | Statuses.WrongChain;

enum Statuses {
  Connected = "connected",
  Disconnected = "disconnected",
  Pending = "pending",
  WrongChain = "wrongchain",
}

const getTruncatedWalletAddress = (address: string = "") => {
  if (!address.length) {
    return "";
  }

  const letters = address.split("");
  const beg = letters.slice(0, 4);
  const end = letters.slice(-4);
  return [...beg, "…", ...end].join("");
};

export function OnboardingButton() {
  const [status, setStatus] = useState<Status>(Statuses.Disconnected);
  const [balance, setBalance] = useState<string>("loading");

  const onboarding = useRef<MetaMaskOnboarding>();

  const { accounts, setAccounts } = useAccountContext();

  const getOnClick = (status: Status) => {
    if (status === Statuses.Connected) {
      return async () => {
        const login = await window.ethereum.request!({
          method: "wallet_requestPermissions",
          params: [
            {
              eth_accounts: {},
            },
          ],
        });
      };
    }

    return async () => {
      if (MetaMaskOnboarding.isMetaMaskInstalled()) {
        setStatus(Statuses.Pending);

        const isPolygon = await checkIfPolygon(window.ethereum);
        if (!isPolygon) {
          return setStatus(Statuses.WrongChain);
        }

        window.ethereum.request!({ method: "eth_requestAccounts" }).then(
          (newAccounts) => {
            setAccounts(newAccounts);
            setStatus(Statuses.Connected);
          }
        );
      } else {
        onboarding.current && onboarding.current.startOnboarding();
      }
    };
  };

  const getButtonText = (status: Status) => {
    switch (status) {
      case Statuses.WrongChain:
        return (
          <>
            <span className="uppercase font-sans">Wrong Network Selected</span>
            <MetamaskIcon className="ml-3 -mr-1 h-5 w-5" aria-hidden="true" />
          </>
        );
      case Statuses.Disconnected:
        return (
          <>
            <span className="uppercase font-sans">Connect</span>
            <MetamaskIcon className="ml-3 -mr-1 h-5 w-5" aria-hidden="true" />
          </>
        );

      case Statuses.Pending:
        return (
          <>
            <span className="font-sans">Verifying…</span>
            <MetamaskIcon className="ml-3 -mr-1 h-5 w-5" aria-hidden="true" />
          </>
        );
      case Statuses.Connected:
        return (
          <>
            <span>{getTruncatedWalletAddress(accounts[0])}</span>
          </>
        );

      default:
        break;
    }
  };

  const useInitializeApp = (accounts: string[]) => {
    useEffect(() => {
      if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
        return;
      }
      if (!accounts.length) {
        setStatus(Statuses.Disconnected);
        return;
      }

      const fetchBalance = async (accounts: string[]) => {
        if (!accounts.length) {
          return;
        }
        const balance = await window.ethereum.request!({
          method: "eth_getBalance",
          params: [accounts[0]],
        });
        const balanceFormatted = parseFloat(
          web3.utils.fromWei(balance, "ether")
        ).toFixed(2);

        setBalance(balanceFormatted);
      };

      setStatus(Statuses.Connected);
      onboarding.current && onboarding.current.stopOnboarding();
      fetchBalance(accounts);
    }, [accounts]);
  };

  useInitializeApp(accounts);

  useEffect(() => {
    async function getCurrentAccount() {
      const isPolygon = await checkIfPolygon(window.ethereum);
      if (!isPolygon) {
        setStatus(Statuses.WrongChain);
        setAccounts([]);
        return;
      }

      const myAccounts = await getAccounts(window.ethereum);
      setAccounts(myAccounts);
    }

    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      getCurrentAccount();
    }
  }, [setAccounts]);

  useEffect(() => {
    async function handleAccountChange(newAccounts: string[]) {
      console.log("switched accounts");
      const isPolygon = await checkIfPolygon(window.ethereum);

      if (!isPolygon) {
        setStatus(Statuses.WrongChain);
        setAccounts([]);
        return;
      }
      setAccounts(newAccounts);
    }

    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      window.ethereum.on("accountsChanged", handleAccountChange);

      window.ethereum.on("chainChanged", (res) => {
        console.log("chainChanged", { res });
        setStatus(Statuses.Disconnected);
        if (res !== "0x89") {
          return setAccounts([]);
        }
      });

      window.ethereum.on("disconnect", (error: ProviderRpcError) => {
        console.error(error);
        window.location.reload();
      });
    }
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountChange);
    };
  }, [accounts, setAccounts]);

  const bgColor =
    status === Statuses.Disconnected
      ? "bg-amber-700 hover:bg-amber-600"
      : "bg-amber-700 hover:bg-amber-600";

  const ButtonGroup = () => {
    return (
      <div className="bg-amber-800 w-auto p-0 rounded-lg flex items-center">
        <span className="px-4 font-normal font-display text-white">
          MATIC {balance}
        </span>
        <span>
          <OnboardingAllStates />
        </span>
      </div>
    );
  };

  const OnboardingAllStates = () => {
    return (
      <button
        type="button"
        disabled={status === Statuses.Pending}
        className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm transition text-base font-display font-normal rounded-md text-white ${bgColor} focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-amber-500`}
        onClick={getOnClick(status)}
      >
        {getButtonText(status)}
      </button>
    );
  };

  return status === Statuses.Connected ? (
    <ButtonGroup />
  ) : (
    <OnboardingAllStates />
  );
}
