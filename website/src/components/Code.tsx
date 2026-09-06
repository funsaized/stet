export function Code({ text }: { text: string }) {
  return (
    <pre>
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
