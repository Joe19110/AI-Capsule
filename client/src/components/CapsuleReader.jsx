function formatDate(value) {
  if (!value) return '';
  const d = new Date(value.includes('T') ? value : value.replace(' ', 'T') + 'Z');
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function CapsuleReader({ capsule, onEdit, onDelete, onBack }) {
  return (
    <div className="reader-inner">
      <button className="btn ghost small back-link" onClick={onBack}>
        ← Back to the index
      </button>

      <div className="reader-head">
        <span className="r-cat">{capsule.category || 'Uncategorised'}</span>
        {capsule.prompt_version && <span className="r-ver">{capsule.prompt_version}</span>}
      </div>

      <p className="project-line">{capsule.project_name}</p>

      <h2>{capsule.prompt_title}</h2>

      <div className="badges">
        {capsule.usefulness && <span className="badge">{capsule.usefulness}</span>}
        <span className={`badge${capsule.reviewed ? ' on' : ''}`}>
          {capsule.reviewed ? 'Reviewed' : 'Not reviewed'}
        </span>
        <span className={`badge${capsule.improved ? ' on' : ''}`}>
          {capsule.improved ? 'Improved' : 'Not improved'}
        </span>
      </div>

      <p className="section-label">Prompt</p>
      <div className="prompt-block">{capsule.prompt_text}</div>

      {capsule.response_summary && (
        <>
          <p className="section-label">Response summary</p>
          <p className="prose">{capsule.response_summary}</p>
        </>
      )}

      {capsule.notes && (
        <>
          <p className="section-label">Notes</p>
          <p className="notes">{capsule.notes}</p>
        </>
      )}

      {capsule.screenshot_url && (
        <>
          <p className="section-label">Screenshot evidence</p>
          <p className="prose">
            <a href={capsule.screenshot_url} target="_blank" rel="noreferrer">
              {capsule.screenshot_url}
            </a>
          </p>
        </>
      )}

      <div className="reader-meta">
        <span>Added {formatDate(capsule.created_at)}</span>
        <div className="reader-actions">
          <button className="btn secondary small" onClick={() => onEdit(capsule)}>
            Edit
          </button>
          <button className="btn danger small" onClick={() => onDelete(capsule)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
