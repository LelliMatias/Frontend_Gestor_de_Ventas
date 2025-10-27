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
        <Route path="proveedores" element={<ProveedoresPage />} />
        <Route path="productos" element={<ProductPage />} />

        {/* --- 2. RUTAS DEL APARTADO DE VENTAS --- */}

        {/* a. La página de LISTA (la que querías ver) */}
        <Route path="ventas" element={<VentaListPage />} />

        {/* b. La página de CREAR (la que ya tenías) */}
        <Route path="ventas/nueva" element={<VentaFormPage />} />

        {/* c. La página de EDITAR (la que usa un ID) */}
        <Route path="ventas/editar/:id" element={<VentaEditPage />} />

        {/* -------------------------------------- */}

        <Route path="*" element={<div>Página no encontrada</div>} />
      </Route>
    </Routes>
  );
}

export default App;
