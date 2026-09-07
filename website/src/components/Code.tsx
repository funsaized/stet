/* oxlint-disable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/prefer-tag-over-role -- Preformatted code is a keyboard-scrollable region; preserve whitespace semantics and keyboard access. */
export function Code({ text }: { text: string }) {
  return (
    <pre tabIndex={0} role="region" aria-label="Code example">
      <code>
        {text
          .split(
            /("[^"\n]*"|'[^'\n]*'|\/\/[^\n]*|\b(?:import|from|const|return|function|export|default|let)\b|\b\d+(?:\.\d+)?\b)/g,
          )
          .map((token, i) => (
            <span
              key={i}
              className={
                /^['"]/.test(token)
                  ? 'token-string'
                  : token.startsWith('//')
                    ? 'token-comment'
                    : /^(import|from|const|return|function|export|default|let)$/.test(token)
                      ? 'token-keyword'
                      : /^\d/.test(token)
                        ? 'token-number'
                        : undefined
              }
            >
              {token}
            </span>
          ))}
      </code>
    </pre>
  );
}
