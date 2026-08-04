import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { taskService } from "../services/taskService";
import { refreshEngine } from "../engine/refresh.engine";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:4000/api";

export interface Task {
  _id: string;
  id?: string;
  title: string;
  description: string;
  category: string;
  xpReward: number;
  coinReward: number;
  dueDate?: string | Date;
  isCompleted?: boolean;
  requiresProof?: boolean;
  difficulty: "Easy" | "Medium" | "Hard" | "easy" | "medium" | "hard";
  isActive: boolean;
  createdAt?: string;
}

export interface CropTask {
  id: string;
  taskId: string;
  title: string;
  description: string;
  category: string;
  xpReward: number;
  coinReward: number;
  requiresProof: boolean;
  difficulty: string;
  stage: string;
  stageOrder: number;
  crop: string;
  status: "locked" | "active" | "approved";
  isCompleted: boolean;
  estimatedTime?: number;
  skillLevel?: string;
}

interface TaskContextType {
  tasks: Task[];
  completedTasks: Task[];
  pendingTasks: Task[];
  loading: boolean;
  error: string | null;
  refreshTasks: () => Promise<void>;
  completeTask: (taskId: string) => Promise<boolean>;
  crops: string[];
  activeCrop: string | null;
  chain: CropTask[];
  chainLoading: boolean;
  setActiveCrop: (crop: string) => void;
  refreshChain: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crops, setCrops] = useState<string[]>([]);
  const [activeCrop, setActiveCropState] = useState<string | null>(null);
  const [chain, setChain] = useState<CropTask[]>([]);
  const [chainLoading, setChainLoading] = useState(false);

  const fetchCrops = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/tasks/my-crops`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) return;
      const data = await response.json();
      const cropList: string[] = data.crops || [];
      setCrops(cropList);
      if (cropList.length > 0) {
        setActiveCropState((prev) => (prev && cropList.includes(prev) ? prev : cropList[0]));
      }
    } catch (err) {
      console.error("Failed to fetch crops:", err);
    }
  }, []);

  const fetchChain = useCallback(async (crop: string) => {
    setChainLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/tasks/crop-chain?crop=${encodeURIComponent(crop)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) return;
      const data = await response.json();
      setChain(data.data || []);
    } catch (err) {
      console.error("Failed to fetch chain:", err);
      setChain([]);
    } finally {
      setChainLoading(false);
    }
  }, []);

  const initializeTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const cachedTasks = await AsyncStorage.getItem("tasks");
      if (cachedTasks) {
        setTasks(JSON.parse(cachedTasks));
      }

      const tasksData = await taskService.getTasks();
      if (tasksData && tasksData.length > 0) {
        setTasks(tasksData);
        await AsyncStorage.setItem("tasks", JSON.stringify(tasksData));
      }
    } catch (err) {
      console.error("Error initializing tasks:", err);
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTasks = useCallback(async () => {
    try {
      setError(null);
      const tasksData = await taskService.getTasks();
      if (tasksData && tasksData.length > 0) {
        setTasks(tasksData);
        await AsyncStorage.setItem("tasks", JSON.stringify(tasksData));
      }
      await refreshChain();
    } catch (err) {
      console.error("Error refreshing tasks:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh tasks");
    }
  }, []);

  const refreshChain = useCallback(async () => {
    if (activeCrop) {
      await fetchChain(activeCrop);
    }
    await fetchCrops();
  }, [activeCrop, fetchChain, fetchCrops]);

  const completeTask = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await taskService.completeTask(taskId);

      if (success) {
        setTasks((prev) => prev.map((task) => (task._id === taskId || task.id === taskId ? { ...task, isCompleted: true } : task)));
        await refreshTasks();
        return true;
      }

      return false;
    } catch (err) {
      console.error("Error completing task:", err);
      setError(err instanceof Error ? err.message : "Failed to complete task");
      return false;
    }
  }, [refreshTasks]);

  useEffect(() => {
    void initializeTasks();
    void fetchCrops();
  }, [fetchCrops, initializeTasks]);

  useEffect(() => {
    refreshEngine.registerTaskRefresh(refreshTasks);
  }, [refreshTasks]);

  useEffect(() => {
    if (activeCrop) {
      void fetchChain(activeCrop);
    }
  }, [activeCrop, fetchChain]);

  const setActiveCrop = (crop: string) => {
    setActiveCropState(crop);
  };

  const completedTasks = tasks.filter((t) => t.isCompleted);
  const pendingTasks = tasks.filter((t) => !t.isCompleted);

  const value: TaskContextType = {
    tasks,
    completedTasks,
    pendingTasks,
    loading,
    error,
    refreshTasks,
    completeTask,
    crops,
    activeCrop,
    chain,
    chainLoading,
    setActiveCrop,
    refreshChain,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks(): TaskContextType {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }

  return context;
}