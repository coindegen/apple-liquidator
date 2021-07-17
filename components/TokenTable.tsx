import { FC, useMemo } from "react";
import {
  SelectorIcon,
  SortAscendingIcon,
  SortDescendingIcon,
} from "@heroicons/react/outline";
import { useSortBy, useTable } from "react-table";
import { ITokenData, IWalletInfo, TokenDictionary } from "lib/types";

const tokenDictionary: TokenDictionary = require("lib/constants/tokenDictionary.json");

export type IAccounts = Record<
  string,
  { liquidity: string; shortfall: string }
>;

export const TokenTable: FC<{
  walletInfo: IWalletInfo;
  tableId: "lend" | "borrow";
}> = ({ walletInfo, tableId }) => {
  const balanceField =
    tableId === "lend" ? "lendBalanceFormatted" : "borrowBalanceFormatted";
  const underlyingValueField =
    tableId === "lend" ? "lendValueUnderlying" : "borrowValueUnderlying";
  const valueUsdField = tableId === "lend" ? "lendValueUsd" : "borrowValueUsd";

  const data: Record<string, any>[] = useMemo(() => {
    const getRepayColumn = (tableId: string, tokenData: ITokenData) => {
      console.log(+tokenData[balanceField]);

      return tableId === "borrow" && +tokenData[balanceField] > 0
        ? {
            repay: (
              <button
                type="button"
                disabled
                onClick={() => {
                  console.log("clicked");
                }}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 cursor-not-allowed"
              >
                Repay
              </button>
            ),
          }
        : {};
    };

    return walletInfo.tokenBalances.map((tokenData) => {
      return {
        symbol: (
          <a
            href={`https://polygonscan.com/address/${tokenData.asset}`}
            className="hover:text-amber-600 underline hover:no-underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {tokenData.symbol}
          </a>
        ),
        balance: `${tokenData[balanceField]} ${tokenData.symbol}`,
        valueUnderlying: `${tokenData[underlyingValueField]} ${
          tokenDictionary[
            tokenDictionary[tokenData.asset.toLowerCase()].underlying
          ].symbol
        }`,
        valueUSD: `${tokenData[valueUsdField]}`,
        ...getRepayColumn(tableId, tokenData),
      };
    });
  }, [
    walletInfo.tokenBalances,
    balanceField,
    underlyingValueField,
    valueUsdField,
    tableId,
  ]);

  const columns = useMemo(() => {
    const headers = [
      {
        Header: tableId === "lend" ? "Lent Tokens" : "Borrowed Tokens",
        accessor: "symbol",
      },
      {
        Header: "Balance",
        accessor: "balance",
      },
      {
        Header: "Value (underlying asset)",
        accessor: "valueUnderlying",
      },
      {
        Header: "Value (USD)",
        accessor: "valueUSD",
      },
    ];

    if (tableId === "borrow") {
      headers.push({
        Header: "",
        accessor: "repay",
      });
    }

    return headers;
  }, [tableId]);

  const tableInstance = useTable({ columns, data }, useSortBy);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  const isSortable = ["valueUnderlying", "balance"];

  return (
    <>
      <div className="flex flex-col mt-6 lg:mt-2 mb-12">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table
                className="min-w-full divide-y divide-white"
                {...getTableProps()}
              >
                <thead className="bg-gray-100">
                  {headerGroups.map((headerGroup, hdIdx) => (
                    <tr {...headerGroup.getHeaderGroupProps()} key={hdIdx}>
                      {headerGroup.headers.map((column, colIdx) => {
                        const getSortableProps = (id: string) => {
                          if (isSortable.includes(id)) {
                            return column.getSortByToggleProps();
                          }
                          return undefined;
                        };
                        return (
                          <th
                            scope="col"
                            className={`
                            
                            px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  `}
                            {...column.getHeaderProps(
                              getSortableProps(column.id)
                            )}
                            key={colIdx}
                          >
                            <div
                              className={`flex flex-row items-center 
                           ${colIdx === 0 ? "justify-start" : "justify-end"} 
                            `}
                            >
                              <div>{column.render("Header")}</div>
                              {isSortable.includes(column.id) ? (
                                <div className="ml-2 w-4 h-4">
                                  {column.isSorted ? (
                                    column.isSortedDesc ? (
                                      <SortDescendingIcon />
                                    ) : (
                                      <SortAscendingIcon />
                                    )
                                  ) : (
                                    <span className="text-gray-300">
                                      <SelectorIcon />
                                    </span>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>

                <tbody {...getTableBodyProps()}>
                  {rows.map((row, rowIdx) => {
                    prepareRow(row);
                    return (
                      <tr
                        className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        {...row.getRowProps()}
                        key={rowIdx}
                      >
                        {row.cells.map((cell, cellIdx) => {
                          return (
                            <td
                              {...cell.getCellProps()}
                              className={`${
                                cellIdx === 0 ? "text-left" : "text-right"
                              } px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900`}
                              key={cellIdx}
                            >
                              {cell.render("Cell")}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
