import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '../lib/utils';

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
                        to="/gestion/productos/nuevo"
                        className={({ isActive }) => cn("transition-colors hover:text-foreground p-2 rounded-md", isActive && activeLinkClass)}
                    >
                        Nuevo Producto
                    </NavLink>
                </nav>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Outlet /> {/* Aquí se renderizarán las páginas anidadas */}
            </main>
        </div>
    );
}