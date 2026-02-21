export function VideoCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-video bg-surface-tertiary rounded-xl" />
      <div className="mt-2 px-0.5 space-y-2">
        <div className="h-4 bg-surface-tertiary rounded w-3/4" />
        <div className="h-3 bg-surface-tertiary rounded w-1/2" />
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2.5 mb-4 px-4">
        <div className="w-7 h-7 rounded-md bg-surface-tertiary animate-pulse" />
        <div className="h-5 bg-surface-tertiary rounded w-32 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
