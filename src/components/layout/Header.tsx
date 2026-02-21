export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-surface-primary/95 backdrop-blur-sm border-b border-white/10">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-8 h-8 bg-accent-red rounded-lg flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold tracking-tight">Video Player</h1>
      </div>
    </header>
  );
}
