import { FC, useMemo, useState } from "react";
import {
  SelectorIcon,
  SortAscendingIcon,
  SortDescendingIcon,
} from "@heroicons/react/outline";
import { makeObjectFromArray } from "lib/utils";
import Link from "next/link";
import { useSortBy, useTable } from "react-table";
import Web3 from "web3";
const allAccounts: IAllAccounts = require("lib/allAccounts.json");

export type IAccounts = Record<
  string,
  { liquidity: string; shortfall: string }
>;

interface IAllAccounts {
  accounts: IAccounts;
  liquidation_incentive: string;
  close_factor: string;
  block_updated: number;
}

export const AccountsTable: FC = () => {
  const accountsInitial = Object.entries(allAccounts.accounts)
    .filter(([_key, val]) => {
      return +val.shortfall > 0;
    })
    .reduce(makeObjectFromArray, {});

  const [accounts, setAccounts] = useState<IAccounts>(accountsInitial);

  type FilterValues = "unhealthy" | "healthy" | "all";

  const [filterValue, setFilterValue] = useState<FilterValues>("unhealthy");

  function setFilter(val: string) {
    switch (val) {
      case "all":
        setAccounts(allAccounts.accounts);
        break;
      case "unhealthy":
        const unhealthyAccounts = accountsInitial;
        setAccounts(unhealthyAccounts);
        break;

      case "healthy":
        const healthyAccounts = Object.entries(allAccounts.accounts)
          .filter(([_key, val]) => {
            return +val.shortfall <= 0;
          })
          .reduce(makeObjectFromArray, {});
        setAccounts(healthyAccounts);

        break;

      default:
        break;
    }
  }

  function HealthFilter() {
    return (
      <div className="flex flex-col lg:flex-row items-center">
        <label
          htmlFor="location"
          className="block text-sm mr-3 font-medium text-gray-700"
        >
          Show:
        </label>
        <select
          id="location"
          name="location"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={filterValue}
          onChange={(e) => {
            setFilterValue(e.target.value as FilterValues);
            setFilter(e.target.value);
          }}
        >
          <option value="unhealthy">Unhealthy</option>
          <option value="healthy">Healthy</option>
          <option value="all">All</option>
        </select>
      </div>
    );
  }

  const data: Record<string, string>[] = useMemo(
    () =>
      Object.entries(accounts).map(([key, val]) => {
        return {
          col1: key,
          col2: Number(Web3.utils.fromWei(val.liquidity)).toFixed(2),
          col3: Number(Web3.utils.fromWei(val.shortfall)).toFixed(2),
        };
      }),
    [accounts]
  );

  const columns = useMemo(
    () => [
      {
        Header: "Address",
        accessor: "col1",
      },
      {
        Header: "Liquidity",
        accessor: "col2",
      },
      {
        Header: "Shortfall",
        accessor: "col3",
      },
    ],
    []
  );

  const tableInstance = useTable({ columns, data }, useSortBy);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <>
      <div className="flex flex-col lg:flex-row justify-between px-4 lg:px-0">
        <h2 className="ml-0 lg:ml-6 mb-4 lg:mb-8 text-gray-800 text-2xl font-semibold text-center lg:text-left">
          All Borrowers
        </h2>

        <div>
          <HealthFilter />
        </div>
      </div>
      <div className="flex flex-col mt-6 lg:mt-0">
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
                      {headerGroup.headers.map((column, colIdx) => (
                        <th
                          scope="col"
                          className={`
                            
                            px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  `}
                          {...column.getHeaderProps(
                            column.getSortByToggleProps()
                          )}
                          key={colIdx}
                        >
                          <div
                            className={`flex flex-row items-center 
                           ${colIdx === 0 ? "justify-start" : "justify-end"} 
                            `}
                          >
                            <div>{column.render("Header")}</div>
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
                          </div>
                        </th>
                      ))}
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
                              {cellIdx === 0 ? (
                                <Link href={`/liquidate/${cell.value}`}>
                                  <a className="hover:text-amber-600 underline hover:no-underline">
                                    {cell.render("Cell")}
                                  </a>
                                </Link>
                              ) : (
                                cell.render("Cell")
                              )}
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
