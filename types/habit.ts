export interface HabitLog {
  id: string;
  date: string;
  is_complete: boolean;
  completed_time?: string;
}

export interface Habit {
  id: string;
  name: string;
  scheduled_time?: string;
  created_at?: string;
  habit_logs: HabitLog[];
}