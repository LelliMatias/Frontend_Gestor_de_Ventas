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
import { VentaListPage } from './pages/VentaListPage';
import { VentaEditPage } from './pages/VentaEditPage';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/gestion" element={<MainLayout />}>
        <Route path="marcas" element={<MarcasPage />} />
        <Route path="lineas" element={<LineasPage />} />
        <Route path="proveedores" element={<ProveedoresPage />} />
        <Route path="productos" element={<ProductPage />} />
        <Route path="ventas" element={<VentaListPage />} />
        <Route path="ventas/nueva" element={<VentaFormPage />} />
        <Route path="ventas/editar/:id" element={<VentaEditPage />} />
        <Route path="reportes" element={<DashboardPage />} />
        <Route path="*" element={<div>Página no encontrada</div>} />
      </Route>
    </Routes>
  );
}

export default App;
