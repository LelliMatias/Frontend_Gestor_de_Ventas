// src/pages/RegisterPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export function RegisterPage() {
    // 1. Mantenemos los tres estados para los tres campos del formulario.
    const [nombre, setNombre] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [contraseña, setContraseña] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Aquí puedes añadir validaciones del lado del cliente si lo deseas

        try {
            // 2. Enviamos el objeto completo con nombre, email y contraseña.
            await api.post('/auth/register', { nombre, email, contraseña });

            setSuccess('¡Usuario registrado con éxito! Redirigiendo al login...');

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err: any) {
            if (err.response && err.response.data) {
                setError(err.response.data.message || 'Error al registrar el usuario.');
            } else {
                setError('No se pudo conectar con el servidor.');
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
                    <CardDescription>
                        Ingresa tus datos para registrarte.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* 3. El formulario tiene los tres campos necesarios. */}
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nombre">Nombre de Usuario</Label>
                            <Input
                                id="nombre"
                                type="text"
                                placeholder="tu_usuario"
                                required
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@correo.com"
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
                        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                        {success && <p className="text-sm font-medium text-emerald-600">{success}</p>}
                        <Button type="submit" className="w-full">
                            Registrarse
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/login" className="underline">
                            Inicia sesión
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}