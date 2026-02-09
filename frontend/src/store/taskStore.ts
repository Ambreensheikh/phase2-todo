// frontend/src/store/taskStore.ts
import { create } from 'zustand';

interface Task {
  id: number;
  title: string; // 'text' ki jagah 'title' use karein taake DB se match ho
  description?: string;
  completed: boolean;
}

interface TaskState {
  tasks: Task[];
  addTask: (title: string) => void;
  toggleTask: (id: number) => void;
  setTasks: (tasks: Task[]) => void;
}

export const useTaskStore = create<TaskState>()((set) => ({
  // Initial dummy data (Optional: isay empty [] bhi rakh sakti hain)
  tasks: [
    { id: 1, title: 'Design the UI for the Hackathon project', completed: true },
    { id: 2, title: 'Implement the chat interface', completed: true },
  ],

  // AI Tool Call ya Manual entry ke liye
  addTask: (title) =>
    set((state) => ({
      tasks: [{ id: Date.now(), title, completed: false }, ...state.tasks],
    })),

  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ),
    })),

  // Jab Dashboard load ho to DB se saari tasks yahan save honge
  setTasks: (tasks) => set({ tasks }),
}));