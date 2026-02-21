export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-surface-primary/95 backdrop-blur-sm border-b border-white/10">
      <div className="flex items-center gap-4 px-5 sm:px-8 lg:px-10 h-16 sm:h-[72px]">
        <div className="w-12 h-12 bg-accent-red rounded-xl flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-current">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Video Player</h1>
      </div>
    </header>
  );
}
