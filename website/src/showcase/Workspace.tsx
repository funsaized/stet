/* oxlint-disable jsx-a11y/no-noninteractive-element-interactions -- Escape bubbles from controls inside the inline confirmation form. */
import { useRef, useState } from 'react';
import { Circle } from '@funsaized/stet/react';
import { ink } from './options';

export function Workspace({
  enabled,
  perspective,
}: {
  enabled: boolean;
  perspective: 'explain' | 'handoff';
}) {
  const remove = useRef<HTMLButtonElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [deleted, setDeleted] = useState(false);
  const [digest, setDigest] = useState(true);
  function cancel() {
    setOpen(false);
    setName('');
    remove.current?.focus();
  }
  return (
    <div className="application" data-fixture="workspace">
      <header>
        <span className="app-monogram">F</span>
        <div>
          <strong>Fieldnotes</strong>
          <span>Workspace / Settings</span>
        </div>
        <small>Local demo</small>
      </header>
      <div className="app-body">
        <h3>A space for the next idea.</h3>
        <p>Manage the Fieldnotes workspace and its delivery preferences.</p>
        <label className="app-check">
          <input type="checkbox" checked={digest} onChange={(e) => setDigest(e.target.checked)} />{' '}
          Send a weekly activity digest
        </label>
        <section className="danger-zone" aria-label="Workspace deletion">
          <span className="eyebrow">DANGER ZONE</span>
          <h4>Delete workspace</h4>
          <p>
            Deletion is irreversible. All projects and API keys in this workspace will be
            permanently removed.
          </p>
          <button
            ref={remove}
            className="app-danger"
            disabled={deleted}
            aria-expanded={open}
            onClick={() => {
              setOpen(true);
              requestAnimationFrame(() => nameInput.current?.focus());
            }}
          >
            Delete workspace
          </button>
          {open && (
            <form
              className="confirmation"
              aria-label="Confirm workspace deletion"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  cancel();
                }
              }}
              onSubmit={(e) => {
                e.preventDefault();
                if (name !== 'Fieldnotes') return;
                setDeleted(true);
                setOpen(false);
              }}
            >
              <h4>Confirm deletion</h4>
              <p>This demo only changes local state. No data is sent or removed from a server.</p>
              <label htmlFor="workspace-name">Type Fieldnotes to confirm</label>
              <input
                id="workspace-name"
                ref={nameInput}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
              />
              <div className="app-actions">
                <button className="app-danger" disabled={name !== 'Fieldnotes'}>
                  Permanently delete
                </button>
                <button type="button" onClick={cancel}>
                  Cancel
                </button>
              </div>
            </form>
          )}
          <output>
            {deleted ? 'Workspace deleted in this local demo.' : 'Your workspace is active.'}
          </output>
          {deleted && (
            <button
              onClick={() => {
                setDeleted(false);
                setName('');
              }}
            >
              Reset workspace
            </button>
          )}
        </section>
      </div>
      {enabled && perspective === 'explain' && <Circle target={remove} {...ink.explain} />}
      {enabled && perspective === 'handoff' && <Circle target={remove} {...ink.handoff} />}
    </div>
  );
}
