import { Playground } from '../components/Playground';
import { usePageMeta } from '../usePageMeta';

export function PlaygroundPage() {
  usePageMeta('The pencil case — Stet playground', '/playground');
  return (
    <main id="main" className="playground-page">
      <Playground />
    </main>
  );
}
