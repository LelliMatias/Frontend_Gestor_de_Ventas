import { NavLink, Outlet } from 'react-router-dom';
// --- CORRECCIÓN: Usar la ruta de alias '@/' ---
import { cn } from '../lib/utils';
// --- 1. Importa el Toaster ---
import { Toaster } from "../components/ui/toaster"; // Ajusta la ruta si es necesario
// --- 2. Importa los iconos ---
import { Tag, Network, Package, Users, List, PlusCircle } from 'lucide-react';

export function MainLayout() {
    const activeLinkClass = "bg-primary text-primary-foreground";
    const linkClasses = "flex items-center gap-2 transition-colors hover:text-foreground p-2 rounded-md";

    return (
        <div className="flex min-h-screen w-full flex-col">
            <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                    <NavLink
                        to="/gestion/marcas"
                        className={({ isActive }) => cn(linkClasses, isActive && activeLinkClass)}
                    >
                        <Tag className="h-4 w-4" /> Marcas
                    </NavLink>
                    <NavLink
                        to="/gestion/lineas"
                        className={({ isActive }) => cn(linkClasses, isActive && activeLinkClass)}
                    >
                        <Network className="h-4 w-4" /> Líneas
                    </NavLink>
                    <NavLink
                        to="/gestion/productos"
                        className={({ isActive }) => cn(linkClasses, isActive && activeLinkClass)}
                    >
                        <Package className="h-4 w-4" /> Productos
                    </NavLink>
                    <NavLink
                        to="/gestion/proveedores"
                        className={({ isActive }) => cn(linkClasses, isActive && activeLinkClass)}
                    >
                        <Users className="h-4 w-4" /> Proveedores
                    </NavLink>
                    
                    {/* --- 3. LINK AÑADIDO (El que te faltaba) --- */}
                    <NavLink
                        to="/gestion/ventas"
                        className={({ isActive }) => cn(linkClasses, isActive && activeLinkClass)}
                    >
                        <List className="h-4 w-4" /> Gestión de Ventas
                    </NavLink>
                    
                    {/* --- 4. LINK MODIFICADO (para consistencia) --- */}
                    <NavLink
                        to="/gestion/ventas/nueva"
                        className={({ isActive }) => cn(linkClasses, isActive && activeLinkClass)}
                    >
                        <PlusCircle className="h-4 w-4" /> Nueva Venta
                    </NavLink>
                </nav>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Outlet /> {/* Aquí se renderizarán las páginas anidadas */}
            </main>
            {/* --- 5. Añade el Toaster al final --- */}
            <Toaster />
        </div>
    );
}
