import { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useTasks = () => {
  // Initialize state from localStorage or with an empty array
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'completed', 'pending'

  // Persist tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task) => {
        const newTask = { ...task, id: uuidv4(), isCompleted: false };
        setTasks(prevTasks => [...prevTasks, newTask]);
    };

  const updateTask = (updatedTask) => {
    setTasks(tasks.map(task => (task.id === updatedTask.id ? updatedTask : task)));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleTaskCompletion = (id) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  // useMemo ensures this complex filtering logic only runs when its dependencies change
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        // Status filter
        if (filterStatus === 'completed') return task.isCompleted;
        if (filterStatus === 'pending') return !task.isCompleted;
        return true;
      })
      .filter(task =>
        task?.title?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
        task?.description?.toLowerCase().includes(searchTerm?.toLowerCase())
      );
  }, [tasks, searchTerm, filterStatus]);

  return {
    tasks,
    filteredTasks,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
  };
};