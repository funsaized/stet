import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  RouterProvider,
} from '@tanstack/react-router';
import { Layout } from './components/Layout';
import { Icon } from './components/Icon';
import { Home } from './pages/Home';
import { Docs } from './pages/Docs';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { usePageMeta } from './usePageMeta';
function NotFound() {
  usePageMeta('Page not found — stet', '/404');
  return (
    <main id="main" className="not-found">
      <span className="handwritten">a small wrong turn.</span>
      <h1>
        This page wandered
        <br />
        off the paper.
      </h1>
      <Link className="button primary" to="/">
        Back to Stet <Icon name="arrow" />
      </Link>
    </main>
  );
}
const rootRoute = createRootRoute({ component: Layout, notFoundComponent: NotFound });
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Home });
const docsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/docs', component: Docs });
const playgroundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/playground',
  component: PlaygroundPage,
});
const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute, docsRoute, playgroundRoute]),
  scrollRestoration: true,
});
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
export function App() {
  return <RouterProvider router={router} />;
}
