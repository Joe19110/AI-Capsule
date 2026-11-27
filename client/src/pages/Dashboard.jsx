import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import CapsuleForm from '../components/CapsuleForm.jsx';
import CapsuleReader from '../components/CapsuleReader.jsx';
import CapsuleMark from '../components/CapsuleMark.jsx';

export default function Dashboard({ user, onUser }) {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await api.list();
      setCapsules(data);
      setSelectedId((prev) => prev ?? data[0]?.id ?? null);
    } catch (e) {
      setError(e.message || 'Could not load your records.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const selected = capsules.find((c) => c.id === selectedId) || null;

  async function handleSave(values) {
    if (editing) {
      const updated = await api.update(editing.id, values);
      setCapsules((cs) => cs.map((c) => (c.id === updated.id ? updated : c)));
      setSelectedId(updated.id);
    } else {
      const created = await api.create(values);
      setCapsules((cs) => [created, ...cs]);
      setSelectedId(created.id);
    }
    setFormOpen(false);
    setEditing(null);
  }

  async function handleDelete(capsule) {
    if (!window.confirm(`Delete "${capsule.prompt_title}"? This cannot be undone.`)) return;
    try {
      await api.remove(capsule.id);
      setCapsules((cs) => {
        const next = cs.filter((c) => c.id !== capsule.id);
        if (capsule.id === selectedId) setSelectedId(next[0]?.id ?? null);
        return next;
      });
    } catch (e) {
      setError(e.message || 'Could not delete the record.');
    }
  }

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      /* ignore */
    }
    onUser(null);
    navigate('/');
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(capsule) {
    setEditing(capsule);
    setFormOpen(true);
  }

  return (
    <>
      <header className="topbar sticky">
        <div className="container topbar-inner">
          <span className="brand">
            AI Capsule<CapsuleMark />
          </span>
          <div className="user-chip">
            {user?.avatar && <img src={user.avatar} alt="" />}
            <span className="name">{user?.name || user?.login}</span>
            <button className="btn ghost" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="app-loading" style={{ minHeight: 'calc(100vh - 66px)' }}>
          <span className="spinner" />
        </div>
      ) : (
        <div className={`workspace${selected ? ' viewing' : ''}`}>
          {/* Left rail: the index of prompt cards */}
          <aside className="rail">
            <div className="rail-head">
              <p className="eyebrow">
                The Index · {String(capsules.length).padStart(2, '0')}{' '}
                {capsules.length === 1 ? 'card' : 'cards'}
              </p>
              <h1>Your library</h1>
              <button className="btn block" onClick={openCreate}>
                + File a new prompt
              </button>
            </div>

            {error && (
              <div className="alert" style={{ margin: '0.9rem 1.25rem' }}>
                {error}
              </div>
            )}

            {capsules.length === 0 ? (
              <div className="rail-empty">Nothing filed yet.</div>
            ) : (
              <div className="rail-list">
                {capsules.map((c, i) => (
                  <button
                    key={c.id}
                    className={`rail-item${c.id === selectedId ? ' active' : ''}`}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <span className="ri-no">{String(capsules.length - i).padStart(2, '0')}</span>
                    <div className="ri-body">
                      <div className="ri-top">
                        {c.category && <span className="ri-cat">{c.category}</span>}
                        {c.prompt_version && <span className="ri-ver">{c.prompt_version}</span>}
                      </div>
                      <p className="ri-title">{c.prompt_title}</p>
                      <p className="ri-project">{c.project_name}</p>
                      <p className="ri-preview">{c.prompt_text}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>

          {/* Right pane: full reading view of the selected prompt */}
          <section className="reader">
            {selected ? (
              <CapsuleReader
                key={selected.id}
                capsule={selected}
                onEdit={openEdit}
                onDelete={handleDelete}
                onBack={() => setSelectedId(null)}
              />
            ) : (
              <div className="empty">
                <div>
                  <p className="eyebrow">Reading room</p>
                  <p className="big">Pull a card to read it.</p>
                  <p>Select a prompt from the index, or file a new one to get started.</p>
                  <button className="btn" onClick={openCreate}>
                    + File your first prompt
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {formOpen && (
        <CapsuleForm
          initial={editing}
          onSave={handleSave}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
