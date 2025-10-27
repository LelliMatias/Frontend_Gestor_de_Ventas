import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Package } from 'lucide-react';

export function RegisterPage() {
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
        try {
            await api.post('/auth/register', { nombre, email, contraseña });
            setSuccess('¡Usuario registrado! Serás redirigido en un momento...');
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
            <div className="flex flex-col items-center gap-4 mb-8">
                <Package className="h-10 w-10 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Crear una Cuenta</h1>
            </div>
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Registro</CardTitle>
                    <CardDescription>Ingresa tus datos para crear una nueva cuenta de vendedor.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2 text-left">
                            <Label htmlFor="nombre">Nombre de Usuario</Label>
                            <Input id="nombre" type="text" placeholder="tu_usuario" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
                        </div>
                        <div className="grid gap-2 text-left">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input id="email" type="email" placeholder="tu@correo.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="grid gap-2 text-left">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input id="password" type="password" required value={contraseña} onChange={(e) => setContraseña(e.target.value)} />
                        </div>
                        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                        {success && <p className="text-sm font-medium text-emerald-600">{success}</p>}
                        <Button type="submit" className="w-full">
                            Crear Cuenta
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