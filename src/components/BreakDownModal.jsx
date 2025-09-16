import { useState } from "react";
import Spinner from "../utils/Spinner";

const BreakdownModal = ({ onClose, onAddTasks, callGeminiAPI }) => {
    const [mainTask, setMainTask] = useState('');
    const [subTasks, setSubTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!mainTask) return;
        setIsLoading(true);
        setSubTasks([]);
        const prompt = `You are a project management assistant. Break down the following complex task into a list of smaller, actionable sub-tasks. For each sub-task, provide a a title, a brief description, a due date (use "TBD" if not applicable), and a priority. Respond with only a JSON array of objects. Task: "${mainTask}"`;
    
        const schema = {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    title: { type: "STRING" },
                    description: { type: "STRING" },
                    dueDate: { type: "STRING" },
                    priority: { type: "STRING", enum: ["high", "medium", "low", "TBD"] }
                }
            }
        };

        const result = await callGeminiAPI(prompt, schema);
        if (result) {
            try {
                const parsed = JSON.parse(result);
                setSubTasks(parsed.map(item => ({ ...item, isSelected: true })));
            } catch(e) {
                console.error("Failed to parse sub-tasks JSON", e);
            }
        }
        setIsLoading(false);
    };

    const toggleSelection = (index) => {
        setSubTasks(currentTasks => 
            currentTasks.map((task, i) => i === index ? { ...task, isSelected: !task.isSelected } : task)
        );
    };
    
    const handleAddSelected = () => {
        const selectedTasks = subTasks
            .filter(task => task.isSelected)
            .map(task => ({
                title: task.title,
                description: task.description,
                dueDate: task.dueDate,
                priority: task.priority,
            }));

        if (selectedTasks.length > 0) {
            onAddTasks(selectedTasks);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-lg">
                <h2 className="text-2xl font-bold mb-4">✨ Break Down a Complex Task</h2>
                <p className="text-gray-600 mb-4">Enter a large task (e.g., "Launch new website"), and the AI will suggest smaller steps.</p>
                <div className="flex gap-2 mb-4">
                    <input type="text" value={mainTask} onChange={(e) => setMainTask(e.target.value)} placeholder="e.g., Organize a team event" className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    <button onClick={handleGenerate} disabled={isLoading || !mainTask} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-32">
                        {isLoading ? <Spinner /> : 'Generate'}
                    </button>
                </div>

                {subTasks.length > 0 && (
                    <div className="mt-4 border-t pt-4 max-h-60 overflow-y-auto">
                        <h3 className="font-semibold mb-2">Suggested Sub-tasks (select to add):</h3>
                        <div className="space-y-2">
                            {subTasks.map((task, index) => (
                                <div key={index} className="flex items-center p-2 rounded-md hover:bg-gray-100">
                                    {/* **FIX 5: ACCESSIBILITY** - Add ID and htmlFor for better usability */}
                                    <input 
                                        type="checkbox" 
                                        id={`task-${index}`}
                                        checked={task.isSelected} 
                                        onChange={() => toggleSelection(index)} 
                                        className="h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer" 
                                    />
                                    <label htmlFor={`task-${index}`} className="ml-3 text-gray-700 cursor-pointer w-full">
                                        <p className="font-medium">{task.title}</p>
                                        <p className="text-sm text-gray-500">{task.description}</p>
                                        <div className="flex items-center gap-2 text-xs mt-1">
                                            {task.dueDate && <span className="bg-gray-200 px-2 py-1 rounded-full">{`Due: ${task.dueDate}`}</span>}
                                            {task.priority && <span className={`px-2 py-1 rounded-full ${task.priority === 'high' ? 'bg-red-200 text-red-800' : task.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>{`Priority: ${task.priority}`}</span>}
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button onClick={handleAddSelected} disabled={subTasks.filter(t => t.isSelected).length === 0} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">Add Selected Tasks</button>
                </div>
            </div>
        </div>
    );
};

export default BreakdownModal;