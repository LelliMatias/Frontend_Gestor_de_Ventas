// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProductFormPage } from './pages/ProductFormPage';
import { MarcasPage } from './pages/MarcasPage';
import { LineasPage } from './pages/LineasPage';
import { MainLayout } from './layouts/MainLayout';
// --- 1. Importa la nueva página ---
import { VentaFormPage } from './pages/VentaFormPage';

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
        {/* --- 2. Añade la nueva ruta de ventas --- */}
        <Route path="ventas/nueva" element={<VentaFormPage />} />
      </Route>
    </Routes>
  );
}

export default App;
