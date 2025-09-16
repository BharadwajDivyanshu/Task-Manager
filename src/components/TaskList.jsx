import TaskItem from "./TaskItem";

const TaskList = ({ tasks, onEdit, onDelete, onToggle }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold text-gray-700">No tasks found!</h3>
        <p className="text-gray-500 mt-2">Try the "✨ Break Down Task" feature to get started!</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {tasks.map(task => <TaskItem key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />)}
    </div>
  );
};

export default TaskList;