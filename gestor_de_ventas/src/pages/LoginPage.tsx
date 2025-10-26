// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export function LoginPage() {
    const [email, setEmail] = useState<string>('');
    const [contraseña, setContraseña] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const login = useAuthStore((state: any) => state.login);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        try {
            const { data } = await api.post('/auth/login', { email, contraseña });
            login(data.access_token, data.user);
            navigate('/gestion/productos/nuevo');

        } catch (err: any) { // El 'any' aquí nos permite inspeccionar el error

            // --- INICIO DE LA MODIFICACIÓN ---

            // 1. Verificamos si el error viene de Axios (err.response)
            //    y si NestJS nos envió un JSON con un 'message'
            if (err.response && err.response.data && err.response.data.message) {
                
                // 2. ¡Aquí está la magia!
                //    Mostramos el mensaje específico del backend ("Usuario no encontrado" o "Contraseña incorrecta")
                setError(err.response.data.message);

            } else {
                // 3. Si no, es un error de red o algo más (ej. el servidor está caído)
                setError('No se pudo conectar con el servidor.');
            }
            
            // --- FIN DE LA MODIFICACIÓN ---
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Usuario</Label>
                            <Input
                                id="email"
                                type="text"
                                placeholder="Ingrese su correo electronico"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={contraseña}
                                onChange={(e) => setContraseña(e.target.value)}
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="w-full">
                            Entrar
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        ¿No tienes una cuenta?{' '}
                        <Link to="/register" className="underline">
                            Regístrate
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}