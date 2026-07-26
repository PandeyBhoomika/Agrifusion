import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { taskService } from "../services/taskService";
import { refreshEngine } from "../engine/refresh.engine";

// ─────────────────────────────────────────────────────────────
// Task Types
// ─────────────────────────────────────────────────────────────

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
  difficulty:
    | "Easy"
    | "Medium"
    | "Hard"
    | "easy"
    | "medium"
    | "hard";
  isActive: boolean;
  createdAt?: string;
}

interface TaskContextType {
  tasks: Task[];
  completedTasks: Task[];
  pendingTasks: Task[];
  loading: boolean;
  error: string | null;

  refreshTasks: () => Promise<void>;

  completeTask: (
    taskId: string
  ) => Promise<boolean>;
}

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────

const TaskContext = createContext<
  TaskContextType | undefined
>(undefined);

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────

export function TaskProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // ---------------------------------------------------------
  // App Startup
  // ---------------------------------------------------------

  useEffect(() => {
    initializeTasks();
  }, []);

  // ---------------------------------------------------------
  // Register Refresh Function
  // ---------------------------------------------------------

  useEffect(() => {
    refreshEngine.registerTaskRefresh(
      refreshTasks
    );
  }, []);

  // ---------------------------------------------------------
  // Initialize Tasks
  // ---------------------------------------------------------

  const initializeTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const cachedTasks =
        await AsyncStorage.getItem("tasks");

      if (cachedTasks) {
        setTasks(JSON.parse(cachedTasks));
      }

      const tasksData =
        await taskService.getTasks();

      if (
        tasksData &&
        tasksData.length > 0
      ) {
        setTasks(tasksData);

        await AsyncStorage.setItem(
          "tasks",
          JSON.stringify(tasksData)
        );
      }
    } catch (err) {
      console.error(
        "Error initializing tasks:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load tasks"
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Refresh Tasks
  // ---------------------------------------------------------

  const refreshTasks = async () => {
    try {
      setError(null);

      const tasksData =
        await taskService.getTasks();

      if (
        tasksData &&
        tasksData.length > 0
      ) {
        setTasks(tasksData);

        await AsyncStorage.setItem(
          "tasks",
          JSON.stringify(tasksData)
        );
      }
    } catch (err) {
      console.error(
        "Error refreshing tasks:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to refresh tasks"
      );
    }
  };

  // ---------------------------------------------------------
  // Complete Task
  // ---------------------------------------------------------

  const completeTask = async (
    taskId: string
  ): Promise<boolean> => {
    try {
      setError(null);

      const success =
        await taskService.completeTask(
          taskId
        );

      if (success) {
        setTasks((prev) =>
          prev.map((task) =>
            task._id === taskId ||
            task.id === taskId
              ? {
                  ...task,
                  isCompleted: true,
                }
              : task
          )
        );

        await refreshTasks();

        return true;
      }

      return false;
    } catch (err) {
      console.error(
        "Error completing task:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to complete task"
      );

      return false;
    }
  };

  // ---------------------------------------------------------
  // Derived State
  // ---------------------------------------------------------

  const completedTasks = tasks.filter(
    (t) => t.isCompleted
  );

  const pendingTasks = tasks.filter(
    (t) => !t.isCompleted
  );

  // ---------------------------------------------------------
  // Context Value
  // ---------------------------------------------------------

  const value: TaskContextType = {
    tasks,
    completedTasks,
    pendingTasks,
    loading,
    error,

    refreshTasks,

    completeTask,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

export function useTasks(): TaskContextType {
  const context =
    useContext(TaskContext);

  if (!context) {
    throw new Error(
      "useTasks must be used within a TaskProvider"
    );
  }

  return context;
}