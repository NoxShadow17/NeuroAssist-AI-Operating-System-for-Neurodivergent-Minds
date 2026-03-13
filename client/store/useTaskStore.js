import { create } from 'zustand';
import api from '../lib/api';

export const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,

  fetchTasks: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/tasks');
      set({ tasks: data, loading: false });
    } catch (err) {
      console.error('Error fetching tasks:', err);
      set({ loading: false });
    }
  },

  addTask: async (taskData) => {
    try {
      const { data } = await api.post('/tasks', taskData);
      set({ tasks: [data, ...get().tasks] });
    } catch (err) {
      console.error('Error adding task:', err);
    }
  },

  updateTask: async (taskId, updates) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, updates);
      const newTasks = get().tasks.map(t => t.id === taskId ? { ...t, ...data } : t);
      set({ tasks: newTasks });
    } catch (err) {
      console.error('Error updating task:', err);
    }
  },

  deleteTask: async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      set({ tasks: get().tasks.filter(t => t.id !== taskId) });
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  },

  toggleTask: async (taskId, completed) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, { completed });
      // The backend returns { task, xpResult } when completed, or just data when not
      const updatedTask = data.task || data;
      const newTasks = get().tasks.map(t => 
        t.id === taskId ? { ...t, ...updatedTask } : t
      );
      set({ tasks: newTasks });
      return data.xpResult; // Useful for UI notifications
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  },

  decomposeTask: async (taskId) => {
    try {
      const { data: steps } = await api.post(`/tasks/${taskId}/decompose`);
      // Update task in state with new steps
      const newTasks = get().tasks.map(t => 
        t.id === taskId ? { ...t, task_steps: steps } : t
      );
      set({ tasks: newTasks });
    } catch (err) {
      console.error('Error decomposing task:', err);
    }
  },

  toggleStep: async (taskId, stepId, completed) => {
    try {
      await api.put(`/tasks/steps/${stepId}`, { completed });
      const newTasks = get().tasks.map(t => {
        if (t.id === taskId) {
          const newSteps = t.task_steps.map(s => 
            s.id === stepId ? { ...s, completed } : s
          );
          return { ...t, task_steps: newSteps };
        }
        return t;
      });
      set({ tasks: newTasks });
    } catch (err) {
      console.error('Error toggling step:', err);
    }
  }
}));
