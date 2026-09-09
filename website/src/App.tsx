import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  lazyRouteComponent,
  Link,
  RouterProvider,
} from '@tanstack/react-router';
import { Layout } from './components/Layout';
import { Icon } from './components/Icon';
import { publicPages, pageComponents, type PageKind } from './seo';
function NotFound() {
  return (
    <main id="main" className="not-found">
      <span className="handwritten">a small wrong turn.</span>
      <h1>
        This page wandered
        <br />
        off the paper.
      </h1>
      <p>Find your way back to the UI annotation library, documentation, and live examples.</p>
      <Link className="button primary" to="/">
        Back to Stet <Icon name="arrow" />
      </Link>
    </main>
  );
}
const modules = import.meta.glob('./pages/*.tsx');
const components = Object.fromEntries(
  Object.entries(pageComponents).map(([kind, name]) => [
    kind,
    lazyRouteComponent(
      modules[`./pages/${name}.tsx`] as () => Promise<Record<string, () => React.JSX.Element>>,
      name,
    ),
  ]),
) as Record<PageKind, ReturnType<typeof lazyRouteComponent>>;
export async function makeRouter(path?: string) {
  const root = createRootRoute({ component: Layout, notFoundComponent: NotFound });
  const routes = publicPages.map((p) =>
    createRoute({ getParentRoute: () => root, path: p.path, component: components[p.kind] }),
  );
  const router = createRouter({
    routeTree: root.addChildren(routes),
    ...(path ? { history: createMemoryHistory({ initialEntries: [path] }) } : {}),
    scrollRestoration: true,
  });
  // Static pages have no loader data to transfer. Keep SSR boundary structure
  // identical in the browser while loading the same matched route before hydration.
  router.ssr = { manifest: undefined };
  await router.load();
  return router;
}
export function App({ router }: { router: Awaited<ReturnType<typeof makeRouter>> }) {
  return <RouterProvider router={router} />;
}
