const priorityStyles = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
};

const TaskItem = ({ task, onEdit, onDelete, onToggle }) => {
  return (
    <div className={`p-4 rounded-lg shadow-sm transition-all duration-300 ${task.isCompleted ? 'bg-gray-100' : 'bg-white'}`}>
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        {/* Task Info */}
        <div className="flex items-start gap-4 flex-1">
          <input
            type="checkbox"
            checked={task.isCompleted}
            onChange={() => onToggle(task.id)}
            className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          />
          <div>
            <h3 className={`font-bold text-lg ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
              {task.title}
            </h3>
            <p className={`text-sm ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-600'}`}>
              {task.description}
            </p>
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
              {task.dueDate && (
                <span className="text-xs text-gray-500">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityStyles[task.priority]}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end sm:justify-start gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="px-3 py-1 text-sm text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="px-3 py-1 text-sm text-red-600 bg-red-100 rounded hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;