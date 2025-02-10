import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProjectionWithAttributes } from '@/app/types/props';

interface BetSlipStore {
  selections: ProjectionWithAttributes[];
  addSelection: (projection: ProjectionWithAttributes) => void;
  removeSelection: (projectionId: string) => void;
  clearSelections: () => void;
  hasSelection: (projectionId: string) => boolean;
}

export const useBetSlipStore = create<BetSlipStore>()(
  persist(
    (set, get) => ({
      selections: [],
      addSelection: (projection) => {
        const hasSelection = get().hasSelection(projection.projection.id);
        if (!hasSelection) {
          set((state) => ({
            selections: [...state.selections, projection],
          }));
        }
      },
      removeSelection: (projectionId) =>
        set((state) => ({
          selections: state.selections.filter(
            (item) => item.projection.id !== projectionId
          ),
        })),
      clearSelections: () => set({ selections: [] }),
      hasSelection: (projectionId) =>
        get().selections.some((item) => item.projection.id === projectionId),
    }),
    {
      name: 'bet-slip-storage',
    }
  )
);
