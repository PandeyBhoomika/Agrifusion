// services/taskService.ts
// Handles all task-related API calls

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task } from '../context/TaskContext';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:4000/api';

export const taskService = {
  /**
   * Fetch all active tasks for the user
   */
  async getTasks(): Promise<Task[]> {
    try {
      const token = await AsyncStorage.getItem('authToken');

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };

      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'GET',
        headers,
      });

      if (!res.ok) {
        console.warn(`Failed to fetch tasks (${res.status})`);
        return [];
      }

      const data = await res.json();

      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      }
      if (data.data && Array.isArray(data.data)) {
        return data.data;
      }
      if (data.tasks && Array.isArray(data.tasks)) {
        return data.tasks;
      }

      console.warn('Unexpected API response format, using mock data');
      return [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  },

  /**
   * Mark a task as complete and award XP/coins
   */
  async completeTask(taskId: string): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('authToken');

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };

      const res = await fetch(`${API_BASE}/tasks/${taskId}/complete`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        console.error(`Failed to complete task (${res.status})`);
        return false;
      }

      const data = await res.json();
      return data.success === true;
    } catch (error) {
      console.error('Error completing task:', error);
      return false;
    }
  },

  /**
   * Get count of pending tasks (not completed)
   */
  async getPendingTaskCount(): Promise<number> {
    try {
      const tasks = await this.getTasks();
      return tasks.filter(t => !t.isCompleted).length;
    } catch (error) {
      console.error('Error getting pending task count:', error);
      return 0;
    }
  },
};

