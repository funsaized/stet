import { useRef, useState } from 'react';
import { Circle, Highlight, Underline } from '@funsaized/stet/react';
import { ink } from './options';
export function Security({ enabled }: { enabled: boolean }) {
  const requirements = useRef<HTMLParagraphElement>(null);
  const revoke = useRef<HTMLButtonElement>(null);
  const setup = useRef<HTMLButtonElement>(null);
  const [password, setPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [revoked, setRevoked] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  return (
    <div className="application" data-fixture="security">
      <header>
        <span className="app-monogram">F</span>
        <div>
          <strong>Fieldnotes</strong>
          <span>Account / Security</span>
        </div>
        <small>Local demo</small>
      </header>
      <div className="app-body">
        <h3>A little more peace of mind.</h3>
        <p>Three implemented controls to inspect before accepting a handoff.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(true);
          }}
        >
          <label htmlFor="password">New password</label>
          <p ref={requirements} id="password-requirements">
            Use at least 12 characters.
          </p>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-describedby="password-requirements"
            minLength={12}
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setSaved(false);
            }}
          />
          <button disabled={password.length < 12}>Update demo password</button>
          <output>
            {saved
              ? 'Password accepted locally; nothing stored.'
              : 'No password is sent to a server.'}
          </output>
        </form>
        <section>
          <h4>Other sessions</h4>
          <p>Laptop · Brooklyn · Last active 2 hours ago</p>
          <button ref={revoke} disabled={revoked} onClick={() => setRevoked(true)}>
            Revoke session
          </button>
          <output>{revoked ? 'Demo session revoked.' : '1 other demo session active.'}</output>
        </section>
        <section>
          <h4>Two-factor authentication</h4>
          <button ref={setup} aria-expanded={twoFactor} onClick={() => setTwoFactor(!twoFactor)}>
            Set up two-factor
          </button>
          {twoFactor && (
            <output>
              Setup step opened. Connect your authentication provider to enroll a real device.
            </output>
          )}
        </section>
      </div>
      {enabled && (
        <>
          <Highlight target={requirements} {...ink.password} />
          <Circle target={revoke} {...ink.session} />
          <Underline target={setup} {...ink.twoFactor} />
        </>
      )}
    </div>
  );
}
