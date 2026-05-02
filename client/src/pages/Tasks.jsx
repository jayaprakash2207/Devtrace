import { useEffect, useState, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import TaskItem from '../components/TaskItem';
import styles from './Tasks.module.css';

const FILTERS = ['all', 'todo', 'in_progress', 'done'];
const FILTER_LABELS = { all: 'All', todo: 'To Do', in_progress: 'In Progress', done: 'Done' };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const data = await getTasks(params);
      setTasks(data);
    } catch {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    setCreating(true);
    try {
      const task = await createTask(newTask);
      setTasks((prev) => [task, ...prev]);
      setNewTask({ title: '', description: '', priority: 'medium' });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || 'Failed to create task.');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const updated = await updateTask(id, data);
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
    } catch {
      setError('Failed to update task.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch {
      setError('Failed to delete task.');
    }
  };

  const counts = tasks.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tasks</h1>
          <p className={styles.sub}>{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowForm((v) => !v)}>
          {showForm ? '✕ Cancel' : '+ New Task'}
        </button>
      </div>

      {error && (
        <div className={styles.error} onClick={() => setError('')}>
          {error} <span>✕</span>
        </div>
      )}

      {showForm && (
        <form className={styles.form} onSubmit={handleCreate}>
          <input
            placeholder="Task title *"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Description (optional)"
            rows={2}
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          <div className={styles.formRow}>
            <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
            <button type="submit" className={styles.createBtn} disabled={creating}>
              {creating ? 'Creating…' : 'Create Task'}
            </button>
          </div>
        </form>
      )}

      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
            onClick={() => setFilter(f)}
          >
            {FILTER_LABELS[f]}
            {f !== 'all' && counts[f] ? <span className={styles.count}>{counts[f]}</span> : null}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : tasks.length === 0 ? (
        <div className={styles.empty}>
          <span>📋</span>
          <p>No tasks here yet.</p>
          <button className={styles.addBtn} onClick={() => setShowForm(true)}>Create your first task</button>
        </div>
      ) : (
        <div className={styles.list}>
          {tasks.map((task) => (
            <TaskItem key={task._id} task={task} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
