import { useVideoStore } from '@/store/useVideoStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Header } from '@/components/layout/Header';
import { CategorySection } from './CategorySection';

export function HomePage() {
  const categories = useVideoStore((s) => s.categories);
  const playerMode = usePlayerStore((s) => s.playerMode);

  return (
    <div
      className="min-h-dvh bg-surface-primary"
      style={{ paddingBottom: playerMode === 'mini' ? 72 : 0 }}
    >
      <Header />
      <main className="pt-8 pb-10">
        {categories.map((cat) => (
          <CategorySection
            key={cat.category.slug}
            category={cat.category}
            videos={cat.contents}
          />
        ))}
      </main>
    </div>
  );
}
