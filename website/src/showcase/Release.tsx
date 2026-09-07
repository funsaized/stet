import { useRef, useState } from 'react';
import { Circle, Highlight, Underline } from '@funsaized/stet/react';
import { ink } from './options';
export function Release({
  enabled,
  review = false,
  fixed = false,
  step,
  onInvalid,
}: {
  enabled: boolean;
  review?: boolean;
  fixed?: boolean;
  step?: number;
  onInvalid?: (invalid: boolean) => void;
}) {
  const nameInput = useRef<HTMLInputElement>(null);
  const titleLabel = useRef<HTMLLabelElement>(null);
  const audienceLabel = useRef<HTMLSpanElement>(null);
  const submit = useRef<HTMLButtonElement>(null);
  const error = useRef<HTMLParagraphElement>(null);
  const [title, setTitle] = useState('');
  const [privatePreview, setPrivatePreview] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [published, setPublished] = useState('');
  return (
    <div className="application" data-fixture="release">
      <header>
        <span className="app-monogram">F</span>
        <div>
          <strong>Fieldnotes</strong>
          <span>Releases / New preview</span>
        </div>
        <small>Local demo</small>
      </header>
      <form
        className="app-body"
        noValidate={review}
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) {
            setInvalid(true);
            onInvalid?.(true);
            if (fixed) nameInput.current?.focus();
            return;
          }
          setInvalid(false);
          onInvalid?.(false);
          setPublished(`${title} published as a ${privatePreview ? 'private' : 'public'} preview.`);
        }}
      >
        <h3>Something worth sharing.</h3>
        <p>Prepare a release preview for your team.</p>
        <label ref={titleLabel} htmlFor="release-name">
          Release name
        </label>
        <input
          ref={nameInput}
          id="release-name"
          required
          value={title}
          aria-invalid={invalid}
          aria-describedby={invalid ? 'release-error' : undefined}
          placeholder="e.g. A safer workspace"
          onChange={(e) => setTitle(e.target.value)}
        />
        {invalid && (
          <p id="release-error" ref={error} role="alert">
            Enter a release name before publishing.
          </p>
        )}
        <label className="app-check">
          <input
            type="checkbox"
            checked={privatePreview}
            onChange={(e) => setPrivatePreview(e.target.checked)}
          />
          <span ref={audienceLabel}>Private preview — only your team</span>
        </label>
        <p className="app-hint">
          Private previews let your team review changes before a public release.
        </p>
        <button className="app-primary" ref={submit}>
          Publish preview
        </button>
        <output>
          {published || 'Nothing published yet. Changes stay in this browser session.'}
        </output>
      </form>
      {enabled && review && (
        <>
          {fixed ? (
            <Circle target={nameInput} {...ink.fixed} />
          ) : (
            <Circle target={submit} {...ink.review} />
          )}
          {invalid && !fixed && <Highlight target={error} {...ink.error} />}
        </>
      )}
      {enabled && !review && (
        <>
          {(step === undefined || step === 0) && <Underline target={titleLabel} {...ink.title} />}
          {(step === undefined || step === 1) && (
            <Highlight target={audienceLabel} {...ink.audience} />
          )}
          {(step === undefined || step === 2) && <Circle target={submit} {...ink.publish} />}
        </>
      )}
    </div>
  );
}
