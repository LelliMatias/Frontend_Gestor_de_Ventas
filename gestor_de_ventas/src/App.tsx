// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProductFormPage } from './pages/ProductFormPage';
import { MarcasPage } from './pages/MarcasPage';
import { LineasPage } from './pages/LineasPage';
import { MainLayout } from './layouts/MainLayout';

function App() {
  return (
    <Routes>
      {/* Rutas de Autenticación */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rutas de Gestión (Protegidas) */}
      <Route path="/gestion" element={<MainLayout />}>
        <Route path="marcas" element={<MarcasPage />} />
        <Route path="lineas" element={<LineasPage />} />
        <Route path="productos/nuevo" element={<ProductFormPage />} />
      </Route>
    </Routes>
  );
}

export default App;