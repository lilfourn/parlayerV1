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

interface BetSlipSelection {
  stats: any;
  player: any;
  projection: ProjectionWithAttributes;
  selectionType: 'more' | 'less';
}

interface BetSlipStore {
  selections: BetSlipSelection[];
  isCollapsed: boolean;
  addSelection: (projection: ProjectionWithAttributes, selectionType: 'more' | 'less') => void;
  removeSelection: (projectionId: string) => void;
  clearSelections: () => void;
  hasSelection: (projectionId: string) => boolean;
  getSelectionType: (projectionId: string) => 'more' | 'less' | undefined;
  getPayoutMultiplier: () => number;
  toggleCollapsed: () => void;
}

export const useBetSlipStore = create<BetSlipStore>()(
  persist(
    (set, get) => ({
      selections: [],
      isCollapsed: false,
      addSelection: (projection, selectionType) => {
        const currentSelections = get().selections;
        const hasSelection = get().hasSelection(projection.projection.id);
        
        if (!hasSelection && currentSelections.length < 6) {
          set((state) => ({
            selections: [...state.selections, { projection, selectionType, stats: projection.stats, player: projection.player }],
          }));
        }
      },
      removeSelection: (projectionId) => {
        set((state) => ({
          selections: state.selections.filter((s) => s.projection.projection.id !== projectionId),
        }));
      },
      clearSelections: () => set({ selections: [] }),
      hasSelection: (projectionId) => {
        return get().selections.some((s) => s.projection.projection.id === projectionId);
      },
      getSelectionType: (projectionId) => {
        return get().selections.find((s) => s.projection.projection.id === projectionId)?.selectionType;
      },
      getPayoutMultiplier: () => {
        const count = get().selections.length;
        return count >= 2 ? PAYOUT_MULTIPLIERS[count as keyof typeof PAYOUT_MULTIPLIERS] || 0 : 0;
      },
      toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    }),
    {
      name: 'bet-slip-storage',
    }
  )
);
