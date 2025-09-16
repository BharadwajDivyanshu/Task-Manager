import { useEffect, useState } from 'react';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import FilterBar from '../components/FilterBar';
import { useTasks } from '../hooks/useTasks';
import Spinner from '../utils/Spinner';
import BreakdownModal from '../components/BreakDownModal';
import ApiErrorNotification from '../utils/ApiErrorNotification';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const Home = () => {
  const {
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
  } = useTasks();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddTaskClick = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTaskClick = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (task) => {
    if (editingTask) {
      updateTask({ ...task, id: editingTask.id });
    } else {
      addTask(task);
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const callGeminiAPI = async (prompt, jsonSchema = null) => {
    setApiError(null);
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      ...(jsonSchema && {
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: jsonSchema,
        }
      })
    };
    
    let response;
    for (let i = 0; i < 4; i++) {
      try {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) break;
      } catch (error) {
        if (i === 3) {
          console.error("API call failed after multiple retries", error);
          setApiError("The AI service is currently unavailable. Please try again later.");
          return null;
        }
      }
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
    
    if (!response || !response.ok) {
      console.error("API request failed with status:", response?.status);
      setApiError(`An error occurred while contacting the AI service (Status: ${response?.status}).`);
      return null;
    }

    try {
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("Invalid response structure from API");
      }
      return text;
    } catch (error) {
      console.error("Error parsing Gemini API response:", error);
      setApiError("Failed to parse the response from the AI service.");
      return null;
    }
  };

  const addMultipleTasks = (taskTitles) => {
  if (!Array.isArray(taskTitles) || taskTitles.length === 0) {
    console.warn("No tasks to add.");
    return;
  }

  console.log(taskTitles)
  taskTitles.forEach(title => {
    addTask(title);
  });

  console.log("Successfully added multiple tasks:", taskTitles);
};

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <main className="container mx-auto p-4 md:p-8">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight text-center sm:text-left">Task Manager ✔</h1>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
                onClick={() => setIsBreakdownModalOpen(true)}
                className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-transform transform hover:scale-105"
            >
                ✨ Break Down Task
            </button>
            <button
                onClick={handleAddTaskClick}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform transform hover:scale-105"
            >
                Add New Task
            </button>
          </div>
        </header>

        {userId && (
          <div className="flex justify-center sm:justify-end mb-4 text-xs sm:text-sm text-gray-500">
            <span className="bg-gray-200 px-3 py-1 rounded-full shadow-inner">
              User ID: {userId}
            </span>
          </div>
        )}

        {apiError && <ApiErrorNotification message={apiError} onClose={() => setApiError(null)} />}

        <FilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 bg-white rounded-lg shadow-sm">
            <Spinner />
            <p className="mt-4 text-gray-500">Loading tasks...</p>
          </div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onEdit={handleEditTaskClick}
            onDelete={deleteTask}
            onToggle={toggleTaskCompletion}
          />
        )}

        {isModalOpen && (
          <TaskForm
            onSave={handleSaveTask}
            onCancel={handleCancel}
            editingTask={editingTask}
            callGeminiAPI={callGeminiAPI}
          />
        )}

        {isBreakdownModalOpen && (
            <BreakdownModal 
                onClose={() => setIsBreakdownModalOpen(false)}
                onAddTasks={addMultipleTasks}
                callGeminiAPI={callGeminiAPI}
            />
        )}
      </main>
    </div>
  );
};

export default Home;