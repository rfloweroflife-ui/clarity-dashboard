import { Label } from '@/hooks/useLabels';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface LabelBadgeProps {
  label: Label;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

export const LabelBadge = ({ label, onRemove, size = 'sm' }: LabelBadgeProps) => {
  // Calculate if text should be light or dark based on background color
  const getContrastColor = (hexColor: string) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
      style={{
        backgroundColor: label.color,
        color: getContrastColor(label.color),
      }}
    >
      {label.name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-70 transition-opacity"
        >
          <X className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />
        </button>
      )}
    </span>
  );
};
