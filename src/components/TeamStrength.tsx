import { getStrengthColor, getStrengthLabel } from '@/lib/leaveTypes';

interface TeamStrengthProps {
  available: number;
  total: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const TeamStrength = ({ available, total, size = 'medium', showLabel = true }: TeamStrengthProps) => {
  const color = getStrengthColor(available, total);
  const label = getStrengthLabel(available, total);
  
  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-3 py-1.5',
    large: 'text-base px-4 py-2'
  };

  return (
    <div className="inline-flex flex-col items-center space-y-1">
      <div
        className={`rounded-full font-semibold transition-all ${sizeClasses[size]} pulse-gentle`}
        style={{
          backgroundColor: color,
          color: 'white'
        }}
      >
        {available}/{total}
      </div>
      {showLabel && size !== 'small' && (
        <span className="text-xs text-muted-foreground text-center">{label}</span>
      )}
    </div>
  );
};

export default TeamStrength;