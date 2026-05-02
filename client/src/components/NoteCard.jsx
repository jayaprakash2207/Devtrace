import styles from './NoteCard.module.css';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return 'just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30)  return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NoteCard({ note, onClick, onDelete }) {
  const snippet = note.content?.trim()
    ? note.content.trim().slice(0, 120) + (note.content.length > 120 ? '…' : '')
    : null;

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(note._id);
  };

  return (
    <div
      className={`${styles.card} ${note.isPinned ? styles.pinned : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>{note.title}</h3>
        <div className={styles.headerRight}>
          {note.isPinned && <span className={styles.pin} title="Pinned">📌</span>}
          <button className={styles.deleteBtn} onClick={handleDelete} title="Delete note">✕</button>
        </div>
      </div>

      {snippet && <p className={styles.snippet}>{snippet}</p>}

      <div className={styles.footer}>
        {note.tags?.length > 0 && (
          <div className={styles.tags}>
            {note.tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.tag}>#{tag}</span>
            ))}
            {note.tags.length > 3 && (
              <span className={styles.tagMore}>+{note.tags.length - 3}</span>
            )}
          </div>
        )}
        <span className={styles.time}>{timeAgo(note.updatedAt)}</span>
      </div>
    </div>
  );
}
