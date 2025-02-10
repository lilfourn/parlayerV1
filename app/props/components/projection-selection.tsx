import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronUp, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ProjectionWithAttributes } from '@/app/types/props';
import { useBetSlipStore } from '@/app/props/stores/bet-slip-store';

interface ProjectionSelectionProps {
  projection: ProjectionWithAttributes;
}

export function ProjectionSelection({ projection }: ProjectionSelectionProps) {
  const lineScore = projection.projection.attributes.line_score;
  const stats = projection.stats?.attributes;
  const avgValue = stats?.average ?? 0;
  const diff = avgValue ? ((lineScore - avgValue) / avgValue) * 100 : 0;
  const diffColor = diff > 0 ? 'text-green-600' : 'text-red-600';
  const { addSelection, hasSelection } = useBetSlipStore();

  const isSelected = hasSelection(projection.projection.id);

  const handleAddProp = () => {
    addSelection(projection);
  };

  return (
    <div className="mt-6">
      <Card className="p-6 space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Projection Details</h3>
          <p className="text-sm text-muted-foreground">
            Review the line and historical stats
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="w-full max-w-sm bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{lineScore}</div>
            <div className="text-sm text-muted-foreground mt-1">Line</div>
          </div>

          {stats && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground">Season Average:</span>
              <span className={cn("font-medium", diffColor)}>
                {avgValue.toFixed(1)}
              </span>
              <span className={cn("text-xs", diffColor)}>
                ({diff > 0 ? '+' : ''}{diff.toFixed(1)}%)
              </span>
            </div>
          )}

          <Button
            className="w-full max-w-sm py-6 text-lg gap-2"
            variant="outline"
            onClick={handleAddProp}
            disabled={isSelected}
          >
            <Plus className="h-5 w-5" />
            {isSelected ? 'Added to Slip' : 'Add Prop'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
