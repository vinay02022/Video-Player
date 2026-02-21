import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/components/home/HomePage';
import { PlayerPage } from '@/components/player/PlayerPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="watch/:slug" element={<PlayerPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
