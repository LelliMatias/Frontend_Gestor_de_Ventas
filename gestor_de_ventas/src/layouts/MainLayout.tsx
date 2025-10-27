import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Toaster } from "../components/ui/toaster";
import { Button } from '../components/ui/button';
import { LogOut, Tag, Network, Package, Users, List, PlusCircle, AreaChart } from 'lucide-react';
import useAuthStore from '../store/authStore';

export function MainLayout() {
    const activeLinkClass = "bg-primary text-primary-foreground";
    const linkClasses = "flex items-center gap-2 transition-colors hover:text-foreground p-2 rounded-md";

    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();
    const isAdmin = user?.rol === 'ADMIN';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            {/* --- CORRECCIÓN AQUÍ: Se añade z-50 --- */}
            <header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">

                {/* Grupo de Navegación */}
                <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                    {/* ... (Tu código de NavLink se mantiene igual) ... */}
                    {isAdmin && (
                        <>
                            <NavLink to="/gestion/marcas" className={({ isActive }) => cn(linkClasses, isActive && activeLinkClass)}><Tag className="h-4 w-4" /> Marcas</NavLink>
                            <NavLink to="/gestion/lineas" className={({ isActive }) => cn(linkClasses, isActive && activeLinkClass)}><Network className="h-4 w-4" /> Líneas</NavLink>
                            <NavLink to="/gestion/proveedores" className={({ isActive }) => cn(linkClasses, isActive && activeLinkClass)}><Users className="h-4 w-4" /> Proveedores</NavLink>
                        </>
                    )}
                    <NavLink to="/gestion/productos" className={({ isActive }) => cn(linkClasses, isActive && activeLinkClass)}><Package className="h-4 w-4" /> Productos</NavLink>
                    <NavLink to="/gestion/ventas" className={({ isActive }) => cn(linkClasses, isActive && activeLinkClass)}><List className="h-4 w-4" /> Gestión de Ventas</NavLink>
                    <NavLink to="/gestion/ventas/nueva" className={({ isActive }) => cn(linkClasses, isActive && activeLinkClass)}><PlusCircle className="h-4 w-4" /> Nueva Venta</NavLink>
                    {isAdmin && (
                        <NavLink to="/gestion/reportes" className={({ isActive }) => cn(linkClasses, isActive && activeLinkClass)}><AreaChart className="h-4 w-4" /> Reportes</NavLink>
                    )}
                </nav>

                {/* Grupo de Usuario y Logout */}
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground hidden sm:inline">
                        Hola, {user?.nombre}
                    </span>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                    </Button>
                </div>

            </header>

            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 max-w-7xl mx-auto w-full">
                <Outlet />
            </main>
            <Toaster />
        </div>
    );
}