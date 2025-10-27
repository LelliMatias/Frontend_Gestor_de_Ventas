import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Toaster } from "../components/ui/toaster";
import { Tag, Network, Package, Users, List, PlusCircle, AreaChart } from 'lucide-react';
import useAuthStore from '../store/authStore'; // <-- 1. Importar el store de autenticación

export function MainLayout() {
    const activeLinkClass = "bg-primary text-primary-foreground";
    const linkClasses = "flex items-center gap-2 transition-colors hover:text-foreground p-2 rounded-md";

    // --- 2. Obtener el rol del usuario desde el store ---
    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.rol === 'ADMIN';

    return (
        <div className="flex min-h-screen w-full flex-col">
            <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">

                    {/* --- 3. Renderizado Condicional: Muestra estos enlaces SOLO si es ADMIN --- */}
                    {isAdmin && (
                        <>
                            <NavLink to="/gestion/marcas" className={({ isActive }) => cn(linkClasses, isActive && activeLinkClass)}>
                                <Tag className="h-4 w-4" /> Marcas
                            </NavLink>
                            <NavLink to="/gestion/lineas" className={({ isActive }) => cn(linkClasses, isActive && activeLinkClass)}>
                                <Network className="h-4 w-4" /> Líneas
                            </NavLink>
                            <NavLink to="/gestion/proveedores" className={({ isActive }) => cn(linkClasses, isActive && activeLinkClass)}>
                                <Users className="h-4 w-4" /> Proveedores
                            </NavLink>
                        </>
                    )}

                    {/* Enlace de Productos (Visible para ambos) */}
                    <NavLink to="/gestion/productos" className={({ isActive }) => cn(linkClasses, isActive && activeLinkClass)}>
                        <Package className="h-4 w-4" /> Productos
                    </NavLink>

                    {/* Enlaces de Ventas (Visible para ambos) */}
                    <NavLink to="/gestion/ventas" className={({ isActive }) => cn(linkClasses, isActive && activeLinkClass)}>
                        <List className="h-4 w-4" /> Gestión de Ventas
                    </NavLink>
                    <NavLink to="/gestion/ventas/nueva" className={({ isActive }) => cn(linkClasses, isActive && activeLinkClass)}>
                        <PlusCircle className="h-4 w-4" /> Nueva Venta
                    </NavLink>

                    {/* Enlace de Reportes (Visible SOLO para ADMIN) */}
                    {isAdmin && (
                        <NavLink to="/gestion/reportes" className={({ isActive }) => cn(linkClasses, isActive && activeLinkClass)}>
                            <AreaChart className="h-4 w-4" /> Reportes
                        </NavLink>
                    )}
                </nav>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Outlet />
            </main>
            <Toaster />
        </div>
    );
}