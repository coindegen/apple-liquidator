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

export type ProxyOwnerUpdate = ContractEventLog<{
  _new: string;
  _old: string;
  0: string;
  1: string;
}>;
export type ProxyUpdated = ContractEventLog<{
  _new: string;
  _old: string;
  0: string;
  1: string;
}>;

export interface Usdc extends BaseContract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  ): Usdc;
  clone(): Usdc;
  methods: {
    IMPLEMENTATION_SLOT(): NonPayableTransactionObject<string>;

    OWNER_SLOT(): NonPayableTransactionObject<string>;

    implementation(): NonPayableTransactionObject<string>;

    proxyOwner(): NonPayableTransactionObject<string>;

    proxyType(): NonPayableTransactionObject<string>;

    transferProxyOwnership(newOwner: string): NonPayableTransactionObject<void>;

    updateAndCall(
      _newProxyTo: string,
      data: string | number[]
    ): PayableTransactionObject<void>;

    updateImplementation(
      _newProxyTo: string
    ): NonPayableTransactionObject<void>;
  };
  events: {
    ProxyOwnerUpdate(cb?: Callback<ProxyOwnerUpdate>): EventEmitter;
    ProxyOwnerUpdate(
      options?: EventOptions,
      cb?: Callback<ProxyOwnerUpdate>
    ): EventEmitter;

    ProxyUpdated(cb?: Callback<ProxyUpdated>): EventEmitter;
    ProxyUpdated(
      options?: EventOptions,
      cb?: Callback<ProxyUpdated>
    ): EventEmitter;

    allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
  };

  once(event: "ProxyOwnerUpdate", cb: Callback<ProxyOwnerUpdate>): void;
  once(
    event: "ProxyOwnerUpdate",
    options: EventOptions,
    cb: Callback<ProxyOwnerUpdate>
  ): void;

  once(event: "ProxyUpdated", cb: Callback<ProxyUpdated>): void;
  once(
    event: "ProxyUpdated",
    options: EventOptions,
    cb: Callback<ProxyUpdated>
  ): void;
}
