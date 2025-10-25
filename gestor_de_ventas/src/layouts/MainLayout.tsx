import { NavLink, Outlet } from 'react-router-dom';
// --- CORRECCIÓN: Usar la ruta de alias '@/' ---
import { cn } from '../lib/utils';
// --- 1. Importa el Toaster ---
import { Toaster } from "../components/ui/toaster"; // Ajusta la ruta si es necesario

export function MainLayout() {
    const activeLinkClass = "bg-primary text-primary-foreground";

    return (
        <div className="flex min-h-screen w-full flex-col">
            <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                    <NavLink
                        to="/gestion/marcas"
                        className={({ isActive }) => cn("transition-colors hover:text-foreground p-2 rounded-md", isActive && activeLinkClass)}
                    >
                        Marcas
                    </NavLink>
                    <NavLink
                        to="/gestion/lineas"
                        className={({ isActive }) => cn("transition-colors hover:text-foreground p-2 rounded-md", isActive && activeLinkClass)}
                    >
                        Líneas
                    </NavLink>
                    <NavLink
                        to="/gestion/productos"
                        className={({ isActive }) => cn("transition-colors hover:text-foreground p-2 rounded-md", isActive && activeLinkClass)}
                    >
                        Productos
                    </NavLink>
                    <NavLink
                        to="/gestion/proveedores"
                        className={({ isActive }) => cn("transition-colors hover:text-foreground", isActive && activeLinkClass)}
                    >
                        Proveedores
                    </NavLink>
                    {/* --- 2. Añade el nuevo enlace de Venta --- */}
                    <NavLink
                        to="/gestion/ventas/nueva"
                        className={({ isActive }) => cn("transition-colors hover:text-foreground p-2 rounded-md", isActive && activeLinkClass)}
                    >
                        Nueva Venta
                    </NavLink>
                </nav>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Outlet /> {/* Aquí se renderizarán las páginas anidadas */}
            </main>
            {/* --- 3. Añade el Toaster al final --- */}
            <Toaster />
        </div>
    );
}

