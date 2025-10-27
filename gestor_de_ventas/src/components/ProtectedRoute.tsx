import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export function ProtectedRoute() {
    const token = useAuthStore((state) => state.token);

    if (!token) {
        // Si no hay token, redirige al usuario a la página de login
        return <Navigate to="/login" replace />;
    }

    // Si hay un token, renderiza el contenido de la ruta protegida (en nuestro caso, el MainLayout)
    return <Outlet />;
}