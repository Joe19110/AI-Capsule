import { useState } from 'react';

const EMPTY = {
  project_name: '',
  prompt_title: '',
  prompt_version: '',
  prompt_text: '',
  response_summary: '',
  category: 'Coding',
  usefulness: 'Good',
  reviewed: false,
  improved: false,
  screenshot_url: '',
  notes: '',
};

export default function CapsuleForm({ initial, onSave, onClose }) {
  const [values, setValues] = useState(() => ({
    ...EMPTY,
    ...(initial || {}),
    reviewed: !!initial?.reviewed,
    improved: !!initial?.improved,
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!values.project_name.trim() || !values.prompt_title.trim() || !values.prompt_text.trim()) {
      setError('Project name, prompt title and prompt text are required.');
      return;
    }
    setSaving(true);
    try {
      await onSave(values);
    } catch (err) {
      setError(err.message || 'Could not save the record.');
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={handleSubmit}>
        <div className="modal-head">
          <h2>{initial ? 'Edit prompt' : 'New prompt'}</h2>
          <button type="button" className="btn ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="alert">{error}</div>}

          <div className="form-row">
            <div className="field">
              <label htmlFor="project_name">Project name *</label>
              <input
                id="project_name"
                value={values.project_name}
                onChange={(e) => set('project_name', e.target.value)}
                placeholder="SmartFarm Irrigation"
              />
            </div>
            <div className="field">
              <label htmlFor="prompt_version">Version</label>
              <input
                id="prompt_version"
                value={values.prompt_version}
                onChange={(e) => set('prompt_version', e.target.value)}
                placeholder="v1"
              />
            </div>
          </div>

          <div className="field full">
            <label htmlFor="prompt_title">Prompt title *</label>
            <input
              id="prompt_title"
              value={values.prompt_title}
              onChange={(e) => set('prompt_title', e.target.value)}
              placeholder="Debug cloud deployment"
            />
          </div>

          <div className="field full">
            <label htmlFor="prompt_text">Prompt text *</label>
            <textarea
              id="prompt_text"
              value={values.prompt_text}
              onChange={(e) => set('prompt_text', e.target.value)}
              placeholder="Why does my Node server fail to start on Render?"
            />
          </div>

          <div className="field full">
            <label htmlFor="response_summary">Response summary</label>
            <textarea
              id="response_summary"
              style={{ minHeight: 60 }}
              value={values.response_summary}
              onChange={(e) => set('response_summary', e.target.value)}
              placeholder="Check the start command and PORT binding."
            />
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={values.category}
                onChange={(e) => set('category', e.target.value)}
              >
                <option>Coding</option>
                <option>Writing</option>
                <option>Research</option>
                <option>Debugging</option>
                <option>Study</option>
                <option>Other</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="usefulness">Usefulness</label>
              <select
                id="usefulness"
                value={values.usefulness}
                onChange={(e) => set('usefulness', e.target.value)}
              >
                <option>Good</option>
                <option>Needs Improvement</option>
              </select>
            </div>
          </div>

          <div className="checks">
            <label className="check">
              <input
                type="checkbox"
                checked={values.reviewed}
                onChange={(e) => set('reviewed', e.target.checked)}
              />
              Reviewed the response
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={values.improved}
                onChange={(e) => set('improved', e.target.checked)}
              />
              Improved the output
            </label>
          </div>

          <div className="field full">
            <label htmlFor="screenshot_url">Screenshot evidence (URL)</label>
            <input
              id="screenshot_url"
              value={values.screenshot_url}
              onChange={(e) => set('screenshot_url', e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="field full">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              style={{ minHeight: 60 }}
              value={values.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Tested and worked."
            />
          </div>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? 'Saving…' : initial ? 'Save changes' : 'Create prompt'}
          </button>
        </div>
      </form>
    </div>
  );
}
