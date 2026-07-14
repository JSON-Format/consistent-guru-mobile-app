import { create } from "zustand";
import { Habit } from "@/types/habit";


interface HabitStore {
  habits: Habit[];

  setHabits: (habits: Habit[]) => void;

  addHabit: (habit: Habit) => void;

  updateHabit: (habit: Habit) => void;

  deleteHabit: (id: string) => void;

  clearHabits: () => void;
}

export const useHabitStore = create<HabitStore>((set) => ({
  habits: [],

  setHabits: (habits) =>
    set({ habits }),

  addHabit: (habit) =>
    set((state) => ({
      habits: [habit, ...state.habits],
    })),

  updateHabit: (habit) =>
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === habit.id ? habit : h
      ),
    })),

  deleteHabit: (id) =>
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== id),
    })),

  clearHabits: () =>
    set({ habits: [] }),
}));