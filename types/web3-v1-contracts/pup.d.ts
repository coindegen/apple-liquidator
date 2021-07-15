/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import BN from "bn.js";
import { ContractOptions } from "web3-eth-contract";
import { EventLog } from "web3-core";
import { EventEmitter } from "events";
import {
  Callback,
  PayableTransactionObject,
  NonPayableTransactionObject,
  BlockType,
  ContractEventLog,
  BaseContract,
} from "./types";

interface EventOptions {
  filter?: object;
  fromBlock?: BlockType;
  topics?: string[];
}

export type Approval = ContractEventLog<{
  owner: string;
  spender: string;
  value: string;
  0: string;
  1: string;
  2: string;
}>;
export type DelegateChanged = ContractEventLog<{
  delegator: string;
  fromDelegate: string;
  toDelegate: string;
  0: string;
  1: string;
  2: string;
}>;
export type DelegateVotesChanged = ContractEventLog<{
  delegate: string;
  previousBalance: string;
  newBalance: string;
  0: string;
  1: string;
  2: string;
}>;
export type OwnershipTransferred = ContractEventLog<{
  previousOwner: string;
  newOwner: string;
  0: string;
  1: string;
}>;
export type Transfer = ContractEventLog<{
  from: string;
  to: string;
  value: string;
  0: string;
  1: string;
  2: string;
}>;

export interface Pup extends BaseContract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  ): Pup;
  clone(): Pup;
  methods: {
    DELEGATION_TYPEHASH(): NonPayableTransactionObject<string>;

    DOMAIN_TYPEHASH(): NonPayableTransactionObject<string>;

    allowance(
      owner: string,
      spender: string
    ): NonPayableTransactionObject<string>;

    approve(
      spender: string,
      amount: number | string | BN
    ): NonPayableTransactionObject<boolean>;

    balanceOf(account: string): NonPayableTransactionObject<string>;

    checkpoints(
      arg0: string,
      arg1: number | string | BN
    ): NonPayableTransactionObject<{
      fromBlock: string;
      votes: string;
      0: string;
      1: string;
    }>;

    decimals(): NonPayableTransactionObject<string>;

    decreaseAllowance(
      spender: string,
      subtractedValue: number | string | BN
    ): NonPayableTransactionObject<boolean>;

    delegate(delegatee: string): NonPayableTransactionObject<void>;

    delegateBySig(
      delegatee: string,
      nonce: number | string | BN,
      expiry: number | string | BN,
      v: number | string | BN,
      r: string | number[],
      s: string | number[]
    ): NonPayableTransactionObject<void>;

    delegates(delegator: string): NonPayableTransactionObject<string>;

    getCurrentVotes(account: string): NonPayableTransactionObject<string>;

    getOwner(): NonPayableTransactionObject<string>;

    getPriorVotes(
      account: string,
      blockNumber: number | string | BN
    ): NonPayableTransactionObject<string>;

    increaseAllowance(
      spender: string,
      addedValue: number | string | BN
    ): NonPayableTransactionObject<boolean>;

    "mint(address,uint256)"(
      _to: string,
      _amount: number | string | BN
    ): NonPayableTransactionObject<void>;

    "mint(uint256)"(
      amount: number | string | BN
    ): NonPayableTransactionObject<boolean>;

    name(): NonPayableTransactionObject<string>;

    nonces(arg0: string): NonPayableTransactionObject<string>;

    numCheckpoints(arg0: string): NonPayableTransactionObject<string>;

    owner(): NonPayableTransactionObject<string>;

    renounceOwnership(): NonPayableTransactionObject<void>;

    symbol(): NonPayableTransactionObject<string>;

    totalSupply(): NonPayableTransactionObject<string>;

    transfer(
      recipient: string,
      amount: number | string | BN
    ): NonPayableTransactionObject<boolean>;

    transferFrom(
      sender: string,
      recipient: string,
      amount: number | string | BN
    ): NonPayableTransactionObject<boolean>;

    transferOwnership(newOwner: string): NonPayableTransactionObject<void>;
  };
  events: {
    Approval(cb?: Callback<Approval>): EventEmitter;
    Approval(options?: EventOptions, cb?: Callback<Approval>): EventEmitter;

    DelegateChanged(cb?: Callback<DelegateChanged>): EventEmitter;
    DelegateChanged(
      options?: EventOptions,
      cb?: Callback<DelegateChanged>
    ): EventEmitter;

    DelegateVotesChanged(cb?: Callback<DelegateVotesChanged>): EventEmitter;
    DelegateVotesChanged(
      options?: EventOptions,
      cb?: Callback<DelegateVotesChanged>
    ): EventEmitter;

    OwnershipTransferred(cb?: Callback<OwnershipTransferred>): EventEmitter;
    OwnershipTransferred(
      options?: EventOptions,
      cb?: Callback<OwnershipTransferred>
    ): EventEmitter;

    Transfer(cb?: Callback<Transfer>): EventEmitter;
    Transfer(options?: EventOptions, cb?: Callback<Transfer>): EventEmitter;

    allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
  };

  once(event: "Approval", cb: Callback<Approval>): void;
  once(event: "Approval", options: EventOptions, cb: Callback<Approval>): void;

  once(event: "DelegateChanged", cb: Callback<DelegateChanged>): void;
  once(
    event: "DelegateChanged",
    options: EventOptions,
    cb: Callback<DelegateChanged>
  ): void;

  once(event: "DelegateVotesChanged", cb: Callback<DelegateVotesChanged>): void;
  once(
    event: "DelegateVotesChanged",
    options: EventOptions,
    cb: Callback<DelegateVotesChanged>
  ): void;

  once(event: "OwnershipTransferred", cb: Callback<OwnershipTransferred>): void;
  once(
    event: "OwnershipTransferred",
    options: EventOptions,
    cb: Callback<OwnershipTransferred>
  ): void;

  once(event: "Transfer", cb: Callback<Transfer>): void;
  once(event: "Transfer", options: EventOptions, cb: Callback<Transfer>): void;
}
