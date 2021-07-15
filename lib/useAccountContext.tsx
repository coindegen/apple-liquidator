import {
  useContext,
  createContext,
  ReactNode,
  useState,
  useMemo,
  Dispatch,
  SetStateAction,
} from "react";

export type IAccount =
  | {
      accounts: string[];
      setAccounts: (addresses: string[]) => void;
    }
  | undefined;

export const AccountContext = createContext<IAccount>(undefined);

export const AccountContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [walletAddresses, setWalletAddresses] = useState<string[]>();

  const accounts = useMemo(() => {
    return walletAddresses;
  }, [walletAddresses]);

  const initialValues = {
    accounts: accounts ?? [],
    setAccounts: setWalletAddresses,
  };

  return (
    <AccountContext.Provider value={initialValues}>
      {children}
    </AccountContext.Provider>
  );
};

export function useAccountContext() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error(
      "useAccountContext must be used within an AccountContextProvider"
    );
  }
  return context;
}
