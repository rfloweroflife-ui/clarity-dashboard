import { useState } from 'react';
import { Label } from '@/hooks/useLabels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { LabelBadge } from './LabelBadge';
import { Tag, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#6b7280',
];

interface LabelSelectProps {
  labels: Label[];
  selectedLabelIds: string[];
  onToggleLabel: (labelId: string) => void;
  onCreateLabel: (name: string, color: string) => Promise<Label | null>;
  compact?: boolean;
}

export const LabelSelect = ({
  labels,
  selectedLabelIds,
  onToggleLabel,
  onCreateLabel,
  compact = false,
}: LabelSelectProps) => {
  const [open, setOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(PRESET_COLORS[0]);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    setIsCreating(true);
    const result = await onCreateLabel(newLabelName.trim(), newLabelColor);
    if (result) {
      onToggleLabel(result.id);
      setNewLabelName('');
      setShowCreateForm(false);
    }
    setIsCreating(false);
  };

  const selectedLabels = labels.filter((l) => selectedLabelIds.includes(l.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? 'icon' : 'sm'}
          className={cn(
            'gap-1',
            compact && 'h-8 w-8',
            selectedLabels.length > 0 && 'text-primary'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Tag className="h-4 w-4" />
          {!compact && (
            <span>{selectedLabels.length > 0 ? `${selectedLabels.length} labels` : 'Labels'}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-2 bg-popover border border-border"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground px-2">Labels</p>
          
          {labels.length === 0 && !showCreateForm && (
            <p className="text-sm text-muted-foreground px-2 py-2">No labels yet</p>
          )}

          <div className="max-h-48 overflow-y-auto space-y-1">
            {labels.map((label) => {
              const isSelected = selectedLabelIds.includes(label.id);
              return (
                <button
                  key={label.id}
                  onClick={() => onToggleLabel(label.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted transition-colors"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="text-sm text-foreground flex-1 text-left truncate">
                    {label.name}
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>

          {showCreateForm ? (
            <div className="border-t border-border pt-2 space-y-2">
              <Input
                placeholder="Label name"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                className="h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateLabel();
                  }
                }}
              />
              <div className="flex gap-1 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewLabelColor(color)}
                    className={cn(
                      'w-5 h-5 rounded-full transition-all',
                      newLabelColor === color && 'ring-2 ring-offset-2 ring-primary ring-offset-popover'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateLabel}
                  disabled={isCreating || !newLabelName.trim()}
                  className="flex-1"
                >
                  Create
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted transition-colors text-sm text-muted-foreground"
            >
              <Plus className="h-4 w-4" />
              Create new label
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
