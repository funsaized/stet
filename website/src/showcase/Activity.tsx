import { useRef, useState } from 'react';
import { Circle, Highlight, Underline } from '@funsaized/stet/react';
import { ink } from './options';
export function Activity({ enabled }: { enabled: boolean }) {
  const filter = useRef<HTMLButtonElement>(null);
  const event = useRef<HTMLButtonElement>(null);
  const read = useRef<HTMLButtonElement>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [allRead, setAllRead] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <div className="application" data-fixture="activity">
      <header>
        <span className="app-monogram">F</span>
        <div>
          <strong>Fieldnotes</strong>
          <span>Activity / Team inbox</span>
        </div>
        <small>Local demo</small>
      </header>
      <div className="app-body">
        <h3>Your team, at a glance.</h3>
        <p>Filter events, open their details and clear unread activity.</p>
        <div className="activity-actions">
          <button ref={filter} aria-pressed={unreadOnly} onClick={() => setUnreadOnly(!unreadOnly)}>
            Unread only
          </button>
          <button ref={read} onClick={() => setAllRead(true)}>
            Mark all read
          </button>
        </div>
        {(!unreadOnly || !allRead) && (
          <div className="activity-event">
            <button ref={event} aria-expanded={open} onClick={() => setOpen(!open)}>
              Maya deployed v2.4 {allRead ? '· Read' : '· Unread'}
            </button>
            {open && <p>Deployment completed in staging. Revision a12bc34 · 4 minutes ago.</p>}
          </div>
        )}
        {!unreadOnly && <p className="app-hint">Yesterday · Alex joined the workspace · Read</p>}
        <output>{allRead ? 'All caught up. No unread events.' : '1 unread event.'}</output>
      </div>
      {enabled && (
        <>
          <Underline target={filter} {...ink.filter} />
          {(!unreadOnly || !allRead) && <Highlight target={event} {...ink.event} />}
          <Circle target={read} {...ink.read} />
        </>
      )}
    </div>
  );
}
