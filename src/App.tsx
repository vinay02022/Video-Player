import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-dvh text-gray-400">
      {label}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Placeholder label="Home Page" />} />
          <Route path="watch/:slug" element={<Placeholder label="Player Page" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
