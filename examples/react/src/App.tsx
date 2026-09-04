import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Arrow, Circle, Highlight, Mark, Sticky, Underline } from "stet/react";
import "./App.css";

type Repository = {
  description: string;
  forks_count: number;
  full_name: string;
  html_url: string;
  stargazers_count: number;
  subscribers_count: number;
};

async function fetchRepository(): Promise<Repository> {
  const response = await fetch("https://api.github.com/repos/TanStack/query");
  if (!response.ok) throw new Error(`GitHub replied ${response.status}`);
  return (await response.json()) as Repository;
}

export default function App() {
  const heading = useRef<HTMLHeadingElement>(null);
  const source = useRef<HTMLAnchorElement>(null);
  const description = useRef<HTMLParagraphElement>(null);
  const refresh = useRef<HTMLButtonElement>(null);
  const stars = useRef<HTMLSpanElement>(null);
  const handRolled = useRef<HTMLSpanElement>(null);
  const { data, dataUpdatedAt, error, isFetching, isPending, refetch } = useQuery({
    queryKey: ["repoData"],
    queryFn: fetchRepository,
  });

  if (isPending) return <main className="status-card">Warming the cache…</main>;

  if (error && !data) {
    return (
      <main className="status-card">
        <p>That query wandered off: {error.message}</p>
        <button type="button" onClick={() => void refetch()}>
          Try again
        </button>
      </main>
    );
  }

  return (
    <main className="query-card">
      <a ref={source} className="source" href={data.html_url} target="_blank" rel="noreferrer">
        Live from the GitHub API
      </a>

      <div className="title-row">
        <div>
          <p className="kicker">TanStack Query × Stet</p>
          <h1 ref={heading}>{data.full_name}</h1>
        </div>
        <button
          ref={refresh}
          type="button"
          className="refresh"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          {isFetching ? "Fetching…" : "Refetch"}
        </button>
      </div>

      <p ref={description} className="description">
        {data.description}
      </p>

      <div className="stats" aria-label="Repository statistics">
        <span>👀 {data.subscribers_count.toLocaleString()} watching</span>
        <span>
          <strong ref={stars}>✨ {data.stargazers_count.toLocaleString()} stars</strong>
        </span>
        <span>🍴 {data.forks_count.toLocaleString()} forks</span>
      </div>

      <div className="cache-note" aria-live="polite">
        <span>{error ? "⚠ last refetch stumbled" : "✓ server state"}</span>
        <span ref={handRolled}>hand-rolled cache</span>
        <time dateTime={new Date(dataUpdatedAt).toISOString()}>
          Updated {new Date(dataUpdatedAt).toLocaleTimeString()}
        </time>
      </div>

      <Circle target={source} seed={1} stroke="#0ea5a4" />
      <Underline target={heading} seed={2} stroke="#f97316" />
      <Highlight target={description} seed={3} fill="#fde047" />
      <Arrow from={heading} to={refresh} label="poke the cache" seed={4} />
      <Sticky target={refresh} text="again! again!" side="bottom" seed={5} />
      <Mark target={stars} kind="right" seed={6} />
      <Mark target={handRolled} kind="wrong" seed={7} />
    </main>
  );
}
