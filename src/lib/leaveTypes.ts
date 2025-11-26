export type LeaveType = 
  | 'annual'
  | 'half_day_am'
  | 'half_day_pm'
  | 'sick'
  | 'training'
  | 'maternity'
  | 'paternity';

export interface LeaveTypeConfig {
  value: LeaveType;
  label: string;
  emoji: string;
  color: string;
  description: string;
}

export const leaveTypes: LeaveTypeConfig[] = [
  {
    value: 'annual',
    label: 'Annual Leave',
    emoji: '🏖️',
    color: 'hsl(210, 100%, 85%)',
    description: 'Regular vacation days'
  },
  {
    value: 'half_day_am',
    label: 'Half Day (Morning)',
    emoji: '🌅',
    color: 'hsl(50, 100%, 75%)',
    description: 'Morning off (AM)'
  },
  {
    value: 'half_day_pm',
    label: 'Half Day (Afternoon)',
    emoji: '🌇',
    color: 'hsl(30, 100%, 75%)',
    description: 'Afternoon off (PM)'
  },
  {
    value: 'sick',
    label: 'Sick Leave',
    emoji: '🤒',
    color: 'hsl(340, 80%, 85%)',
    description: 'When you\'re not feeling well'
  },
  {
    value: 'training',
    label: 'Training Leave',
    emoji: '📚',
    color: 'hsl(270, 70%, 85%)',
    description: 'Learning and development'
  },
  {
    value: 'maternity',
    label: 'Maternity Leave',
    emoji: '🤱',
    color: 'hsl(150, 60%, 85%)',
    description: 'New mother care'
  },
  {
    value: 'paternity',
    label: 'Paternity Leave',
    emoji: '👨‍👧',
    color: 'hsl(35, 40%, 80%)',
    description: 'New father care'
  }
];

export const getLeaveTypeConfig = (type: LeaveType): LeaveTypeConfig => {
  return leaveTypes.find(lt => lt.value === type) || leaveTypes[0];
};

export const getStrengthColor = (available: number, total: number): string => {
  const ratio = available / total;
  if (ratio >= 0.80) return 'hsl(var(--strength-full))'; // 8-10 available
  if (ratio >= 0.60) return 'hsl(var(--strength-good))'; // 6-7 available
  if (ratio >= 0.40) return 'hsl(var(--strength-lean))'; // 4-5 available
  return 'hsl(var(--strength-low))'; // 4 or fewer
};

export const getStrengthLabel = (available: number, total: number): string => {
  const ratio = available / total;
  if (ratio >= 0.82) return 'Team at full power! ⚡';
  if (ratio >= 0.64) return 'Good coverage today! 👍';
  if (ratio >= 0.45) return 'Running lean but we\'ve got this! 💪';
  return 'Small but mighty crew today! 🚨';
};