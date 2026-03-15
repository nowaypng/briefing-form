import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import AdminLogin from './admin/AdminLogin.tsx';
import AdminDashboard from './admin/AdminDashboard.tsx';
import AdminDetail from './admin/AdminDetail.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/briefings" element={<AdminDashboard />} />
        <Route path="/admin/briefings/:id" element={<AdminDetail />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
