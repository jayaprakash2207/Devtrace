import { useCallback, useEffect, useState } from 'react';
import { getNotes, createNote, updateNote, deleteNote } from '../api/notes';
import { useToast } from '../context/ToastContext';
import NoteCard  from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import styles from './Notes.module.css';

const FILTERS = [
  { key: 'all',    label: 'All notes' },
  { key: 'pinned', label: '📌 Pinned' },
];

export default function Notes() {
  const toast = useToast();

  // Data
  const [notes,   setNotes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [total,   setTotal]   = useState(0);

  // UI state
  const [filter,  setFilter]  = useState('all');
  const [search,  setSearch]  = useState('');
  const [tagFilter, setTagFilter] = useState('');

  // Modal state
  const [modalOpen,   setModalOpen]   = useState(false);
  const [activeNote,  setActiveNote]  = useState(null); // null = create, obj = edit
  const [saving,      setSaving]      = useState(false);

  // Delete confirmation
  const [deleting, setDeleting] = useState(null);

  /* ── Fetch ───────────────────────────────────────── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filter === 'pinned') params.pinned = 'true';
      if (tagFilter) params.tag = tagFilter;
      const res = await getNotes(params);
      setNotes(res.data);
      setTotal(res.pagination?.total ?? res.data.length);
    } catch {
      toast.error('Failed to load notes.');
    } finally {
      setLoading(false);
    }
  }, [filter, tagFilter, toast]);

  useEffect(() => { load(); }, [load]);

  /* ── Derived: client-side search filter ──────────── */
  const visible = search.trim()
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.content?.toLowerCase().includes(search.toLowerCase()) ||
          n.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : notes;

  /* ── All unique tags from current notes ──────────── */
  const allTags = [...new Set(notes.flatMap((n) => n.tags ?? []))].slice(0, 12);

  /* ── Handlers ────────────────────────────────────── */
  const openCreate = () => { setActiveNote(null); setModalOpen(true); };
  const openEdit   = (note) => { setActiveNote(note); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setActiveNote(null); };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (activeNote?._id) {
        const res = await updateNote(activeNote._id, formData);
        setNotes((prev) => prev.map((n) => (n._id === res.data._id ? res.data : n)));
        toast.success('Note updated.');
      } else {
        const res = await createNote(formData);
        setNotes((prev) => [res.data, ...prev]);
        setTotal((t) => t + 1);
        toast.success('Note created.');
      }
      closeModal();
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'Save failed.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (deleting === id) {
      try {
        await deleteNote(id);
        setNotes((prev) => prev.filter((n) => n._id !== id));
        setTotal((t) => t - 1);
        toast.success('Note deleted.');
      } catch {
        toast.error('Delete failed.');
      } finally {
        setDeleting(null);
      }
    } else {
      setDeleting(id);
      setTimeout(() => setDeleting(null), 3000);
    }
  };

  /* ── Render ──────────────────────────────────────── */
  return (
    <div className="page-wrap">

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Notes</h1>
          <p className={styles.sub}>{total} note{total !== 1 ? 's' : ''} saved</p>
        </div>
        <button className={styles.newBtn} onClick={openCreate}>
          + New note
        </button>
      </div>

      {/* Toolbar: search + filters */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filterBtns}>
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              className={`${styles.filterBtn} ${filter === key ? styles.filterActive : ''}`}
              onClick={() => { setFilter(key); setTagFilter(''); }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tag cloud */}
      {allTags.length > 0 && (
        <div className={styles.tagCloud}>
          <button
            className={`${styles.tagPill} ${!tagFilter ? styles.tagActive : ''}`}
            onClick={() => setTagFilter('')}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`${styles.tagPill} ${tagFilter === tag ? styles.tagActive : ''}`}
              onClick={() => setTagFilter(tag === tagFilter ? '' : tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Hint for double-click to delete */}
      {deleting && (
        <div className={styles.deleteHint}>
          ⚠ Click delete again to confirm — this cannot be undone.
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 160, borderRadius: 14, animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📝</span>
          <h2 className={styles.emptyTitle}>
            {search ? 'No notes match your search' : 'No notes yet'}
          </h2>
          <p className={styles.emptyDesc}>
            {search
              ? 'Try a different keyword or clear the search.'
              : 'Create your first note to capture ideas, snippets, and decisions.'}
          </p>
          {!search && (
            <button className={styles.newBtn} onClick={openCreate}>
              Create first note
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {visible.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onClick={() => openEdit(note)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {modalOpen && (
        <NoteModal
          note={activeNote}
          onSave={handleSave}
          onClose={closeModal}
          saving={saving}
        />
      )}
    </div>
  );
}
