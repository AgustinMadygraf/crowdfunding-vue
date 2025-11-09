export type MilestoneStatus = 'active' | 'pending' | 'completed';

export interface Milestone {
  id: number;
  name: string;
  targetAmount: number;
  raisedAmount: number;
  targetDate: string;
  status: MilestoneStatus;
}
