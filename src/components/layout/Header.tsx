export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-surface-primary/95 backdrop-blur-sm border-b border-white/10">
      <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 h-14 sm:h-16">
        <div className="w-10 h-10 bg-accent-red rounded-xl flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold tracking-tight">Video Player</h1>
      </div>
    </header>
  );
}
