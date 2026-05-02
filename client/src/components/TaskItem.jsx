import { useState } from 'react';
import styles from './TaskItem.module.css';

const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };
const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High' };

export default function TaskItem({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: task.title, description: task.description, status: task.status, priority: task.priority });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(task._id, form);
    setSaving(false);
    setEditing(false);
  };

  const cycleStatus = () => {
    const next = { todo: 'in_progress', in_progress: 'done', done: 'todo' };
    onUpdate(task._id, { status: next[task.status] });
  };

  if (editing) {
    return (
      <div className={styles.card}>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={styles.input} />
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={styles.textarea}
          rows={2}
          placeholder="Description (optional)"
        />
        <div className={styles.row}>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={styles.select}>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={styles.select}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button className={styles.save} onClick={handleSave} disabled={saving}>
            {saving ? '…' : 'Save'}
          </button>
          <button className={styles.cancel} onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${task.status === 'done' ? styles.done : ''}`}>
      <button className={`${styles.statusBtn} ${styles[task.status]}`} onClick={cycleStatus} title="Cycle status">
        {task.status === 'done' ? '✓' : task.status === 'in_progress' ? '●' : '○'}
      </button>
      <div className={styles.content}>
        <p className={styles.title}>{task.title}</p>
        {task.description && <p className={styles.desc}>{task.description}</p>}
        <div className={styles.meta}>
          <span className={`${styles.badge} ${styles[`p_${task.priority}`]}`}>{PRIORITY_LABELS[task.priority]}</span>
          <span className={`${styles.badge} ${styles[`s_${task.status}`]}`}>{STATUS_LABELS[task.status]}</span>
          <span className={styles.date}>{new Date(task.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      <div className={styles.actions}>
        <button className={styles.edit} onClick={() => setEditing(true)}>✏️</button>
        <button className={styles.delete} onClick={() => onDelete(task._id)}>🗑️</button>
      </div>
    </div>
  );
}
