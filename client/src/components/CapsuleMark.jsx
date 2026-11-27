// The capsule glyph used in the wordmark (and matching the favicon).
// A two-tone, tilted medicine-capsule lozenge.
export default function CapsuleMark({ className = '', size = 22 }) {
  return (
    <svg
      className={`capsule-mark ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="AI Capsule logo"
    >
      <defs>
        <clipPath id="cm-pill">
          <rect x="4" y="10.5" width="24" height="11" rx="5.5" ry="5.5" />
        </clipPath>
      </defs>
      <g transform="rotate(-35 16 16)">
        <g clipPath="url(#cm-pill)">
          <rect x="4" y="10.5" width="12" height="11" fill="var(--accent)" />
          <rect x="16" y="10.5" width="12" height="11" fill="var(--surface-2)" />
        </g>
        <rect
          x="4"
          y="10.5"
          width="24"
          height="11"
          rx="5.5"
          ry="5.5"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="1.6"
        />
        <line x1="16" y1="10.5" x2="16" y2="21.5" stroke="var(--ink)" strokeWidth="1.6" />
        <rect x="7" y="12.4" width="7" height="2" rx="1" fill="#ffffff" opacity="0.35" />
      </g>
    </svg>
  );
}
