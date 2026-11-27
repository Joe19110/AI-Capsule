import { Link } from 'react-router-dom';
import CapsuleMark from '../components/CapsuleMark.jsx';
import { useReveal } from '../useReveal.js';

export default function Landing({ user }) {
  const cta = user ? '/dashboard' : '/login';
  const ctaLabel = user ? 'Open your workspace' : 'Sign in with GitHub';

  useReveal();

  return (
    <div className="lp">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link to="/" className="brand">
            AI Capsule<CapsuleMark />
          </Link>
          <nav className="lp-nav">
            <a href="#catalog">The idea</a>
            <a href="#card">A capsule</a>
            {user ? (
              <Link to="/dashboard" className="btn secondary small">
                Open workspace
              </Link>
            ) : (
              <Link to="/login" className="btn secondary small">
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* ---- Split hero: type on the left, a tangible artifact on the right ---- */}
      <section className="lp-hero container">
        <div className="lp-hero-copy hero-enter">
          <p className="eyebrow">Index · No. 03 · Prompt Library</p>
          <h1>
            A card catalog for the prompts you&nbsp;<em>keep reaching for.</em>
          </h1>
          <p className="lede">
            Good prompts get buried in chat history. AI Capsule files each one like a library
            card — the prompt, its project, its version, and what you learned — so you can find it
            again instead of rewriting it.
          </p>
          <div className="hero-actions">
            <Link to={cta} className="btn">
              {ctaLabel}
            </Link>
            <a className="btn secondary" href="#card">
              See a capsule
            </a>
          </div>
          <p className="lp-foot-note">Private to your GitHub account · Nothing shared</p>
        </div>

        <div className="lp-hero-art hero-enter art-enter" aria-hidden="true">
          <div className="stack">
            <article className="idxcard c3">
              <span className="punch" />
              <header>
                <span className="cat">Writing</span>
                <span className="ver">v2</span>
              </header>
              <h4>Tighten an abstract</h4>
              <p className="snip">Rewrite this 200-word abstract to lead with the result…</p>
            </article>

            <article className="idxcard c2">
              <span className="punch" />
              <header>
                <span className="cat">Research</span>
                <span className="ver">v1</span>
              </header>
              <h4>Compare two approaches</h4>
              <p className="snip">List trade-offs between polling and webhooks for…</p>
            </article>

            <article className="idxcard c1">
              <span className="punch" />
              <header>
                <span className="cat">Debugging</span>
                <span className="ver">v3</span>
              </header>
              <h4>Why won't it deploy?</h4>
              <p className="snip">My Node server starts locally but crashes on Render…</p>
              <footer>
                <span className="chip on">Reviewed</span>
                <span className="chip">Improved</span>
              </footer>
            </article>
          </div>
        </div>
      </section>

      {/* ---- Catalog strip: the idea stated as a thin horizontal ledger ---- */}
      <section className="lp-catalog" id="catalog">
        <div className="container catalog-row">
          <div className="cat-cell" data-reveal>
            <span className="n">A</span>
            <p>
              <strong>File it fast.</strong> Save the prompt with its project, version and
              category the moment it works.
            </p>
          </div>
          <div className="cat-cell" data-reveal style={{ '--reveal-delay': '90ms' }}>
            <span className="n">B</span>
            <p>
              <strong>Note what happened.</strong> Mark it reviewed or improved and jot how the
              response actually turned out.
            </p>
          </div>
          <div className="cat-cell" data-reveal style={{ '--reveal-delay': '180ms' }}>
            <span className="n">C</span>
            <p>
              <strong>Pull it back out.</strong> Browse your library, reopen any card, edit it or
              retire it.
            </p>
          </div>
        </div>
      </section>

      {/* ---- Spec-style definition list of a capsule's fields ---- */}
      <section className="lp-spec container" id="card">
        <div className="spec-head" data-reveal>
          <p className="eyebrow">Anatomy</p>
          <h2>What one capsule holds</h2>
          <p className="spec-sub">
            Each record is deliberately small — enough context to trust it later, nothing more.
          </p>
        </div>
        <dl className="spec-list">
          <div data-reveal>
            <dt>Prompt</dt>
            <dd>The exact text you sent, kept verbatim.</dd>
          </div>
          <div data-reveal style={{ '--reveal-delay': '60ms' }}>
            <dt>Project &amp; version</dt>
            <dd>Where it belongs and which iteration it is — v1, v2, v3.</dd>
          </div>
          <div data-reveal style={{ '--reveal-delay': '120ms' }}>
            <dt>Category</dt>
            <dd>Coding, writing, research, debugging, study.</dd>
          </div>
          <div data-reveal style={{ '--reveal-delay': '180ms' }}>
            <dt>Response summary</dt>
            <dd>A line on what the model gave back.</dd>
          </div>
          <div data-reveal style={{ '--reveal-delay': '60ms' }}>
            <dt>Usefulness</dt>
            <dd>Good, or needs improvement — your call.</dd>
          </div>
          <div data-reveal style={{ '--reveal-delay': '120ms' }}>
            <dt>Reviewed &amp; improved</dt>
            <dd>Two flags that track whether you acted on it.</dd>
          </div>
          <div data-reveal style={{ '--reveal-delay': '180ms' }}>
            <dt>Evidence</dt>
            <dd>An optional link to a screenshot of the result.</dd>
          </div>
          <div data-reveal style={{ '--reveal-delay': '240ms' }}>
            <dt>Notes</dt>
            <dd>A reflection for the next time you reach for it.</dd>
          </div>
        </dl>
      </section>

      {/* ---- Ledger footer with a closing CTA ---- */}
      <footer className="lp-ledger">
        <div className="container ledger-row" data-reveal>
          <div>
            <p className="eyebrow">Start your index</p>
            <h2>Your library is one sign-in away.</h2>
          </div>
          <Link to={cta} className="btn">
            {ctaLabel}
          </Link>
        </div>
        <div className="container ledger-foot">
          <span>AI Capsule</span>
          <span>A cloud-deployed AI prompt manager</span>
        </div>
      </footer>
    </div>
  );
}
