import { IProof } from "@/utils/interfaces";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type ProofState = {
  mode: "add" | "edit" | "delete" | null;
  currentProof: IProof | null;
  thoughtId: number | null;
};

type ProofActions = {
  setMode: (mode: ProofState["mode"]) => void;
  clearMode: () => void;
  setProof: (proof: ProofState["currentProof"]) => void;
  clearProof: () => void;
  setThoughtId: (id: ProofState["thoughtId"]) => void;
  clearThoughtId: () => void;
};

export const useProofStore = create<ProofState & ProofActions>()(
  immer((set) => ({
    mode: null,
    currentProof: null,
    thoughtId: null,
    setMode: (mode) =>
      set((state) => {
        state.mode = mode;
      }),
    clearMode: () =>
      set((state) => {
        state.mode = null;
      }),
    setProof: (proof) =>
      set((state) => {
        state.currentProof = proof;
      }),
    clearProof: () =>
      set((state) => {
        state.currentProof = null;
      }),
    setThoughtId: (id) =>
      set((state) => {
        state.thoughtId = id;
      }),
    clearThoughtId: () =>
      set((state) => {
        state.thoughtId = null;
      }),
  })),
);
