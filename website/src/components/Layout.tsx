import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import { Icon } from './Icon';
import { REPO } from '../constants';
import { usePageMeta } from '../usePageMeta';
import { findPage } from '../seo';
export function Layout() {
  usePageMeta();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const page = findPage(path);
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <div className="nav-inner">
          <Link to="/" className="wordmark" aria-label="Stet home">
            stet<span className="wordmark-dots">•••</span>
          </Link>
          <nav aria-label="Main navigation">
            <Link to="/use-cases">Use Cases</Link>
            <Link to="/agent-workflow">Agent Workflow</Link>
            <Link to="/playground">Playground</Link>
            <Link to="/docs">Docs</Link>
            <a href={REPO} className="github-link" aria-label="GitHub repository">
              <Icon name="github" />
              <span>GitHub</span>
              <span className="external-small">↗</span>
            </a>
          </nav>
          <Link to="/" hash="install" className="nav-cta">
            Get started <Icon name="arrow" size={15} />
          </Link>
        </div>
      </header>
      {page && page.path !== '/' && (
        <nav aria-label="Breadcrumb" className="breadcrumbs">
          <Link to="/">Stet</Link>
          <span> / </span>
          {page.parent && (
            <>
              <Link to={page.parent}>{findPage(page.parent)!.label}</Link>
              <span> / </span>
            </>
          )}
          <span aria-current="page">{page.label}</span>
        </nav>
      )}
      <Outlet />
      <footer className="site-footer">
        <div className="footer-top">
          <Link to="/" className="wordmark">
            stet<span className="wordmark-dots">•••</span>
          </Link>
          <span>A little less perfect. A little more human.</span>
          <a href={REPO}>
            Made in the open <Icon name="external" size={14} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} stet · MIT licensed</span>
          <span className="handwritten">leave your mark.</span>
          <a href="https://www.npmjs.com/package/@funsaized/stet/v/0.1.0">
            v0.1.0 <span className="status-dot" />
          </a>
        </div>
      </footer>
    </>
  );
}
