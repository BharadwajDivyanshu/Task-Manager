import { useState, useEffect } from "react";
import Spinner from "../utils/Spinner";

const TaskForm = ({ onSave, onCancel, editingTask, callGeminiAPI }) => {
  const [task, setTask] = useState({ title: '', description: '', dueDate: '', priority: 'medium' });
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  useEffect(() => {
    if (editingTask) {
        if (editingTask.dueDate && editingTask.dueDate !== 'TBD') {
            const date = new Date(editingTask.dueDate);
            if (!isNaN(date)) {
                setTask({ ...editingTask, dueDate: date.toISOString().split('T')[0] });
            } else {
                setTask({ ...editingTask, dueDate: '' });
            }
        } else {
            setTask({ ...editingTask, dueDate: '' });
        }
    }
  }, [editingTask]);
  
  const handleGenerateDesc = async () => {
      if (!task.title) return;
      setIsGeneratingDesc(true);
      const prompt = `You are a helpful assistant. Write a concise and clear description for the following task title. Task Title: "${task.title}"`;
      const generatedDescription = await callGeminiAPI(prompt);
      if (generatedDescription) {
        setTask(prev => ({ ...prev, description: generatedDescription }));
      }
      setIsGeneratingDesc(false);
  };

  const handleChange = (e) => setTask({ ...task, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); onSave(task); };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-md">
        <h2 className="text-2xl font-bold mb-4">{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Title</label>
            <input type="text" id="title" name="title" value={task.title} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
                <label htmlFor="description" className="block text-gray-700 font-medium">Description</label>
                <button type="button" onClick={handleGenerateDesc} disabled={!task.title || isGeneratingDesc} className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                    {isGeneratingDesc ? <Spinner size="sm"/> : '✨ Generate'}
                </button>
            </div>
            <textarea id="description" name="description" value={task.description} onChange={handleChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="dueDate" className="block text-gray-700 font-medium mb-2">Due Date</label>
              <input type="date" id="dueDate" name="dueDate" value={task.dueDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
              <label htmlFor="priority" className="block text-gray-700 font-medium mb-2">Priority</label>
              <select id="priority" name="priority" value={task.priority} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingTask ? 'Save Changes' : 'Add Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;