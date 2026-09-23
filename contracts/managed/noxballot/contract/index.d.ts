import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  voter_credential(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, { voter_id: Uint8Array,
                                                                                 eligibility_key: Uint8Array
                                                                               }];
  admin_secret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  vote_choice(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
}

export type ImpureCircuits<PS> = {
  cast_vote(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  update_session(context: __compactRuntime.CircuitContext<PS>,
                 new_deadline_0: bigint,
                 new_max_0: bigint,
                 active_0: boolean): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  cast_vote(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  update_session(context: __compactRuntime.CircuitContext<PS>,
                 new_deadline_0: bigint,
                 new_max_0: bigint,
                 active_0: boolean): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  nox_admin_key(sk_0: Uint8Array): Uint8Array;
  make_vote_nullifier(voter_id_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  cast_vote(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  update_session(context: __compactRuntime.CircuitContext<PS>,
                 new_deadline_0: bigint,
                 new_max_0: bigint,
                 active_0: boolean): __compactRuntime.CircuitResults<PS, []>;
  nox_admin_key(context: __compactRuntime.CircuitContext<PS>, sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  make_vote_nullifier(context: __compactRuntime.CircuitContext<PS>,
                      voter_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type Ledger = {
  readonly admin: Uint8Array;
  readonly is_active: boolean;
  readonly deadline: bigint;
  readonly total_votes: bigint;
  readonly votes_for: bigint;
  readonly votes_against: bigint;
  readonly votes_abstain: bigint;
  readonly max_voters: bigint;
  nullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               admin_hash_0: Uint8Array,
               expiry_0: bigint,
               voter_cap_0: bigint): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
