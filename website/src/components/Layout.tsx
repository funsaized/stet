import { Link, Outlet } from '@tanstack/react-router';
import { Icon } from './Icon';
import { REPO } from '../constants';
export function Layout() {
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
          <a href="https://www.npmjs.com/package/@funsaized/stet/v/0.0.2">
            v0.0.2 <span className="status-dot" />
          </a>
        </div>
      </footer>
    </>
  );
}
