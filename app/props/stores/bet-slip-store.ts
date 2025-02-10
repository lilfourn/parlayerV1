import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProjectionWithAttributes } from '@/app/types/props';

const PAYOUT_MULTIPLIERS = {
  2: 3,
  3: 5,
  4: 10,
  5: 20,
  6: 37.5
} as const;

interface BetSlipStore {
  selections: ProjectionWithAttributes[];
  addSelection: (projection: ProjectionWithAttributes) => void;
  removeSelection: (projectionId: string) => void;
  clearSelections: () => void;
  hasSelection: (projectionId: string) => boolean;
  getPayoutMultiplier: () => number;
}

export const useBetSlipStore = create<BetSlipStore>()(
  persist(
    (set, get) => ({
      selections: [],
      addSelection: (projection) => {
        const currentSelections = get().selections;
        const hasSelection = get().hasSelection(projection.projection.id);
        
        if (!hasSelection && currentSelections.length < 6) {
          set((state) => ({
            selections: [...state.selections, projection],
          }));
        }
      },
      removeSelection: (projectionId) => {
        set((state) => ({
          selections: state.selections.filter((s) => s.projection.id !== projectionId),
        }));
      },
      clearSelections: () => set({ selections: [] }),
      hasSelection: (projectionId) => {
        return get().selections.some((s) => s.projection.id === projectionId);
      },
      getPayoutMultiplier: () => {
        const count = get().selections.length;
        return count >= 2 ? PAYOUT_MULTIPLIERS[count as keyof typeof PAYOUT_MULTIPLIERS] || 0 : 0;
      },
    }),
    {
      name: 'bet-slip-storage',
    }
  )
);
