import { useEffect, useRef, useState } from 'react';
import styles from './NoteModal.module.css';

const EMPTY = { title: '', content: '', tags: '', isPinned: false };

export default function NoteModal({ note, onSave, onClose, saving }) {
  const isEdit = !!note?._id;
  const [form, setForm] = useState(EMPTY);
  const titleRef = useRef(null);

  useEffect(() => {
    if (note) {
      setForm({
        title: note.title ?? '',
        content: note.content ?? '',
        tags: note.tags?.join(', ') ?? '',
        isPinned: note.isPinned ?? false,
      });
    } else {
      setForm(EMPTY);
    }
    // Focus title on open
    setTimeout(() => titleRef.current?.focus(), 60);
  }, [note]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const tags = form.tags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 10);
    onSave({ title: form.title.trim(), content: form.content.trim(), tags, isPinned: form.isPinned });
  };

  return (
    <div className={styles.backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit note' : 'New note'}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.heading}>{isEdit ? 'Edit Note' : 'New Note'}</h2>
          <button className={styles.close} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Title */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="note-title">Title *</label>
            <input
              id="note-title"
              ref={titleRef}
              value={form.title}
              onChange={set('title')}
              placeholder="Note title"
              maxLength={200}
              required
            />
          </div>

          {/* Content */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="note-content">Content</label>
            <textarea
              id="note-content"
              value={form.content}
              onChange={set('content')}
              placeholder="Write your note here…"
              rows={8}
              maxLength={10000}
              className={styles.textarea}
            />
            <span className={styles.charCount}>{form.content.length} / 10 000</span>
          </div>

          {/* Tags */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="note-tags">Tags</label>
            <input
              id="note-tags"
              value={form.tags}
              onChange={set('tags')}
              placeholder="react, backend, ideas  (comma-separated)"
            />
          </div>

          {/* Pin toggle */}
          <label className={styles.pinRow}>
            <span className={styles.pinIcon}>📌</span>
            <span className={styles.pinLabel}>Pin this note</span>
            <div className={styles.toggleWrap}>
              <input
                type="checkbox"
                id="note-pin"
                checked={form.isPinned}
                onChange={set('isPinned')}
                className={styles.toggleInput}
              />
              <div className={`${styles.toggle} ${form.isPinned ? styles.toggleOn : ''}`} />
            </div>
          </label>

          {/* Actions */}
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={saving || !form.title.trim()}
            >
              {saving ? <><span className="spinner" style={{ width:14,height:14,borderWidth:2 }} /> Saving…</> : isEdit ? 'Save changes' : 'Create note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
