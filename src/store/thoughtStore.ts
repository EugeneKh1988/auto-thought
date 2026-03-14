import { IThought } from '@/utils/interfaces';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
 
type ThoughtState = {
  mode: 'add' | 'edit' | 'delete' | null;
  currentThought: IThought | null;
  situationId: number | null;
}
 
type ThoughtActions = {
  setMode: (mode: ThoughtState['mode']) => void;
  clearMode: () => void;
  setThought: (thought: ThoughtState['currentThought']) => void;
  clearThought: () => void;
  setSituationId: (id: ThoughtState['situationId']) => void;
  clearSituationId: () => void;
}

export const useThoughtStore = create<ThoughtState & ThoughtActions>()(
    immer((set) => ({
        mode: null,
        currentThought: null,
        situationId: null,
        setMode: (mode) => set((state) => { state.mode = mode }),
        clearMode: () => set((state) => { state.mode = null }),
        setThought: (thought) => set((state) => { state.currentThought = thought }),
        clearThought: () => set((state) => { state.currentThought = null }),
        setSituationId: (id) => set((state) => { state.situationId = id }),
        clearSituationId: () => set((state) => { state.situationId = null}),
    }))
);