import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useTaskStore } from '../store/useTaskStore';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Sparkles, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp,
  Clock,
  Zap,
  MoreVertical,
  CheckSquare
} from 'lucide-react';

const TaskPlanner = () => {
  const { tasks, fetchTasks, addTask, updateTask, deleteTask, toggleTask, decomposeTask, toggleStep } = useTaskStore();
  const { profile } = useAuthStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Personal');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandedTask, setExpandedTask] = useState(null);
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await addTask({ 
      title: newTaskTitle, 
      category: newTaskCategory, 
      priority: newTaskPriority,
      description: newTaskDescription 
    });
    setNewTaskTitle('');
    setNewTaskDescription('');
    setShowAdvanced(false);
  };

  const handleToggleTask = async (taskId, completed) => {
    const xp = await toggleTask(taskId, completed);
    // Future: Add a cool XP toast here
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      setIsDeleting(taskId);
      await deleteTask(taskId);
      setIsDeleting(false);
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = async (taskId) => {
    if (!editTitle.trim()) return;
    await updateTask(taskId, { title: editTitle });
    setEditingTaskId(null);
  };

  const handleDecompose = async (taskId) => {
    setIsDecomposing(taskId);
    await decomposeTask(taskId);
    setIsDecomposing(false);
    setExpandedTask(taskId);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black dark:text-white">Task Planner</h1>
            <p className="text-slate-500 font-medium">Break down big goals into tiny wins.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-800">
             <Zap className="w-4 h-4 fill-indigo-600 dark:fill-indigo-400" />
             <span>AI Assisted</span>
          </div>
        </header>

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-800 rounded-[32px] shadow-xl shadow-slate-200/50 dark:shadow-none border-2 border-transparent focus-within:border-indigo-500 transition-all overflow-hidden">
          <form onSubmit={handleAddTask} className="p-2 flex flex-col">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What's on your mind? (e.g., 'Clean the kitchen')"
                className="flex-1 p-4 bg-transparent outline-none text-xl font-medium dark:text-white"
              />
              <button 
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
            
            <div className="px-4 pb-4 flex flex-wrap items-center gap-4">
              <select 
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                className="bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-xl text-sm font-bold dark:text-slate-200 outline-none border-none cursor-pointer"
              >
                <option value="Personal">🏠 Personal</option>
                <option value="Work">💼 Work</option>
                <option value="Study">📚 Study</option>
                <option value="Health">💪 Health</option>
                <option value="Finance">💰 Finance</option>
              </select>

              <select 
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className={`px-3 py-1.5 rounded-xl text-sm font-black uppercase tracking-tighter outline-none border-none cursor-pointer ${
                  newTaskPriority === 'high' ? 'bg-red-100 text-red-600' : 
                  newTaskPriority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                }`}
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>

              <button 
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-bold text-slate-400 hover:text-indigo-500 transition-colors uppercase tracking-widest ml-auto"
              >
                {showAdvanced ? 'Hide Details' : 'Add Details'}
              </button>
            </div>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4"
                >
                  <textarea 
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Add more context or details here..."
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl outline-none resize-none dark:text-slate-300 text-sm font-medium border-2 border-transparent focus:border-indigo-100 dark:focus:border-indigo-900 transition-all h-24"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          <AnimatePresence>
            {[...tasks]
              .sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                  return priorityOrder[a.priority] - priorityOrder[b.priority];
                }
                return new Date(b.created_at) - new Date(a.created_at);
              })
              .map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-white dark:bg-slate-800 rounded-3xl border transition-all ${
                  expandedTask === task.id ? 'ring-2 ring-indigo-500 border-transparent shadow-xl' : 'border-slate-100 dark:border-slate-700'
                } ${task.completed ? 'opacity-75' : ''}`}
              >
                <div className="p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <button 
                      onClick={() => handleToggleTask(task.id, !task.completed)}
                      className={`transition-colors ${task.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-500'}`}
                    >
                      {task.completed ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                    </button>
                    <div className="flex-1">
                      {editingTaskId === task.id ? (
                        <input 
                          autoFocus
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => saveEdit(task.id)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit(task.id)}
                          className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg font-bold dark:text-white"
                        />
                      ) : (
                        <h3 
                          onDoubleClick={() => startEditing(task)}
                          className={`text-lg font-bold dark:text-white capitalize cursor-pointer ${task.completed ? 'line-through text-slate-400' : ''}`}
                        >
                          {task.title}
                        </h3>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">{task.category}</span>
                        {task.task_steps?.length > 0 && (
                          <span className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                            {task.task_steps.filter(s => s.completed).length}/{task.task_steps.length} Steps
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {(!task.task_steps || task.task_steps.length === 0) && !task.completed && (
                      <button 
                        onClick={() => handleDecompose(task.id)}
                        disabled={isDecomposing === task.id}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-indigo-200 transition-all disabled:opacity-50"
                      >
                        {isDecomposing === task.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                        ) : <Sparkles className="w-4 h-4" />}
                        Decompose
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      disabled={isDeleting === task.id}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                      className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors dark:text-slate-400"
                    >
                      {expandedTask === task.id ? <ChevronUp /> : <ChevronDown />}
                    </button>
                  </div>
                </div>

                {/* Expanded Steps */}
                <AnimatePresence>
                  {expandedTask === task.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30"
                    >
                      <div className="p-6 space-y-3">
                        {task.task_steps?.length > 0 ? (
                          task.task_steps.map((step) => (
                            <div 
                              key={step.id}
                              className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 shadow-sm group"
                            >
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => toggleStep(task.id, step.id, !step.completed)}
                                  className={`transition-colors ${step.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-500'}`}
                                >
                                  {step.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                </button>
                                <span className={`font-medium ${step.completed ? 'line-through text-slate-400' : 'dark:text-slate-200'}`}>
                                  {step.step_text}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {step.estimated_minutes}m
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-slate-400 text-sm">Need help starting? Click "Decompose" above.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>

          {tasks.length === 0 && (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[40px] flex items-center justify-center mx-auto mb-6">
                 <CheckSquare className="w-10 h-10 text-slate-300" />
              </div>
              <h2 className="text-xl font-bold dark:text-white">Your planner is empty</h2>
              <p className="text-slate-500">Add a task above to start your journey.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TaskPlanner;
