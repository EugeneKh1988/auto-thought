import { ISituation } from '@/utils/interfaces';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
 
type SituationState = {
  mode: 'add' | 'edit' | 'delete' | null;
  currentSituation: ISituation | null;
  situationId: number | null;
}
 
type SituationActions = {
  setMode: (mode: SituationState['mode']) => void;
  clearMode: () => void;
  setSituation: (situation: SituationState['currentSituation']) => void;
  clearSituation: () => void;
  setSituationId: (id: SituationState['situationId']) => void;
  clearSituationId: () => void;
}

export const useSituationStore = create<SituationState & SituationActions>()(
    immer((set) => ({
        mode: null,
        currentSituation: null,
        situationId: null,
        setMode: (mode) => set((state) => { state.mode = mode }),
        clearMode: () => set((state) => { state.mode = null }),
        setSituation: (situation) => set((state) => { state.currentSituation = situation }),
        clearSituation: () => set((state) => { state.currentSituation = null }),
        setSituationId: (id) => set((state) => { state.situationId = id }),
        clearSituationId: () => set((state) => { state.situationId = null}),
    }))
);