import { useEffect, useState, type ReactNode } from 'react';
import { Icon } from './Icon';
export function CopyButton({
  value,
  children,
  className = '',
}: {
  value: string;
  children?: ReactNode;
  className?: string;
}) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  useEffect(() => {
    if (status === 'idle') return;
    const timer = window.setTimeout(() => setStatus('idle'), 2400);
    return () => clearTimeout(timer);
  }, [status]);
  return (
    <button
      className={`copy-button ${className}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setStatus('copied');
        } catch {
          setStatus('failed');
        }
      }}
      aria-label={status === 'copied' ? 'Copied to clipboard' : children ? undefined : 'Copy code'}
    >
      {children}
      <span className="copy-feedback" aria-live="polite">
        {status === 'copied' ? 'Copied!' : status === 'failed' ? 'Select & copy manually' : ''}
      </span>
      <Icon name={status === 'copied' ? 'check' : 'copy'} size={16} />
    </button>
  );
}
