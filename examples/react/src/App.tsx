import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Arrow, Circle, Highlight, Mark, Sticky, Underline } from "@funsaized/stet/react";
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
  const underlineHint = useRef<HTMLParagraphElement>(null);
  const refreshHint = useRef<HTMLParagraphElement>(null);
  const delight = useRef<HTMLSpanElement>(null);
  const approved = useRef<HTMLSpanElement>(null);
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
      <div className="stet-demo-banner"><strong>stet-ified / react</strong><span>TanStack Query, reviewed in colored ink.</span><small>Proof no. 02 · keep it live</small></div>
      <a ref={source} className="source" href={data.html_url} target="_blank" rel="noreferrer">
        Live from the GitHub API
      </a>

      <div className="title-row">
        <div className="heading-block">
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
        <p ref={underlineHint} className="stet-demo-note"><small>01 / boiling ink</small>A little wiggle under the big idea.</p>
        <p ref={refreshHint} className="stet-demo-note teal"><small>02 / live control</small>Poke the cache. This arrow wiggles; the button works.</p>
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

      <div className="stet-demo-review"><span className="review-label">Margin verdict</span><span ref={delight}>room for delight</span><span ref={approved} className="review-stamp">human-approved</span></div>
      <p className="stet-demo-motion">Motion respects reduced-motion settings. The data and controls are real.</p>
      <Circle target={source} seed={1} stroke="#0ea5a4" />
      <Underline target={heading} seed={2} stroke="#f97316" boil={1.5} />
      <Highlight target={description} seed={3} fill="#fde047" />
      <Arrow from={underlineHint} to={heading} seed={4} boil={1.5} stroke="#f97316" curvature={-0.2} />
      <Arrow from={refreshHint} to={refresh} seed={8} boil={1.5} stroke="#258a80" curvature={0.2} />
      <Highlight target={delight} seed={9} fill="#a0e6c9" />
      <Circle target={approved} seed={10} stroke="#9164bd" resketchOnHover />
      <Sticky target={approved} text="Ship the interesting version." side="bottom" seed={5} fill="#f3d4e5" />
      <Mark target={stars} kind="right" seed={6} />
      <Mark target={handRolled} kind="wrong" seed={7} />
    </main>
  );
}
