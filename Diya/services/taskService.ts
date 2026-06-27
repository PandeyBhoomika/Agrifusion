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
        console.warn(`Failed to fetch tasks (${res.status}), using mock data`);
        return getMockTasks();
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
      return getMockTasks();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return getMockTasks();
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

/**
 * Mock task data for development/testing
 */
function getMockTasks(): Task[] {
  return [
    {
      _id: 't1',
      id: 't1',
      title: 'Drip Irrigation Check',
      description: 'Inspect the main water line for leaks and ensure all drip emitters are flowing.',
      category: 'Water Conservation',
      xpReward: 15,
      coinReward: 5,
      dueDate: new Date(),
      isCompleted: false,
      requiresProof: false,
      difficulty: 'Easy',
      isActive: true,
    },
    {
      _id: 't2',
      id: 't2',
      title: 'Apply Neem Oil Spray',
      description: 'Spray neem oil mixture on the tomato crop to prevent aphid infestation.',
      category: 'Pest Control',
      xpReward: 30,
      coinReward: 10,
      dueDate: new Date(),
      isCompleted: false,
      requiresProof: true,
      difficulty: 'Medium',
      isActive: true,
    },
    {
      _id: 't3',
      id: 't3',
      title: 'Soil Testing Sample',
      description: 'Collect 5 soil samples from the northern plot and send to the lab.',
      category: 'Soil Health',
      xpReward: 50,
      coinReward: 20,
      dueDate: new Date(),
      isCompleted: false,
      requiresProof: true,
      difficulty: 'Hard',
      isActive: true,
    },
  ];
}
