// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MarcasPage } from './pages/MarcasPage';
import { LineasPage } from './pages/LineasPage';
import { MainLayout } from './layouts/MainLayout';
import { VentaFormPage } from './pages/VentaFormPage';
import { ProveedoresPage } from './pages/ProveedoresPage';
import { ProductPage } from './pages/ProductPage';

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
        <Route path="ventas/nueva" element={<VentaFormPage />} />
        <Route path="proveedores" element={<ProveedoresPage />} />
        <Route path="*" element={<div>Página no encontrada</div>} />
        <Route path="productos" element={<ProductPage />} />
      </Route>
    </Routes>
  );
}

export default App;
