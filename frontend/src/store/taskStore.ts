// frontend/src/store/taskStore.ts
import { create } from 'zustand'; // Named import use karein

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

interface TaskState {
  tasks: Task[];
  addTask: (text: string) => void;
  toggleTask: (id: number) => void;
  setTasks: (tasks: Task[]) => void;
}

// Zustand v4+ mein syntax: create<TaskState>()((set) => ...)
export const useTaskStore = create<TaskState>()((set) => ({
  tasks: [
    { id: 1, text: 'Design the UI for the Hackathon project', completed: true },
    { id: 2, text: 'Implement the chat interface', completed: true },
    { id: 3, text: 'Connect the frontend to the backend API', completed: false },
    { id: 4, text: 'Add real-time updates for the task board', completed: false },
  ],
  addTask: (text) =>
    set((state) => ({
      tasks: [...state.tasks, { id: Date.now(), text, completed: false }],
    })),
  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ),
    })),
  setTasks: (tasks) => set({ tasks }),
}));