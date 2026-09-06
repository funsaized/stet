import type { Kind } from '../constants';
export function MarkGlyph({ kind }: { kind: Kind }) {
  return (
    <svg viewBox="0 0 50 30" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {kind === 'circle' && <path d="M38 7C19-2 0 7 5 20S49 29 46 12C43 4 24 1 14 5" />}
        {kind === 'underline' && (
          <>
            <path d="M7 23q19-3 36-1M8 26q15-1 26 0" />
            <path d="M17 16 24 3l7 13m-11-5h8" opacity=".5" />
          </>
        )}
        {kind === 'highlight' && (
          <>
            <path d="m7 10 36-2-2 16-36 1Z" fill="currentColor" opacity=".25" stroke="none" />
            <path d="m18 21 7-15 7 15m-11-5h8" />
          </>
        )}
        {kind === 'arrow' && <path d="M5 24Q18 0 44 11m-9-8 10 8-12 5" />}
        {kind === 'sticky' && (
          <>
            <path
              d="m12 3 29 2-2 19-8 5-21-2ZM31 29l1-8 7 3"
              fill="currentColor"
              fillOpacity=".13"
            />
            <path d="m17 11 17 1m-17 5 12 1" />
          </>
        )}
        {kind === 'mark' && <path d="m11 15 8 8L37 4" />}
      </g>
    </svg>
  );
}
