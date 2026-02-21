import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/components/home/HomePage';

function PlayerPagePlaceholder() {
  return (
    <div className="flex items-center justify-center h-dvh text-gray-400">
      Player Page (coming next)
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="watch/:slug" element={<PlayerPagePlaceholder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
