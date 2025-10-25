import { useState, useEffect } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

// Interface para tipar los datos del proveedor
interface Proveedor {
    id: number;
    nombre: string;
    telefono?: string;
    email?: string;
    direccion?: string;
}

export function ProveedoresPage() {
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        email: '',
        direccion: ''
    });

    // Función para cargar los proveedores desde la API
    const fetchProveedores = () => {
        api.get<Proveedor[]>('/proveedores').then(res => {
            setProveedores(res.data);
        });
    };

    // Cargar los proveedores cuando el componente se monta
    useEffect(fetchProveedores, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nombre) return;
        try {
            await api.post('/proveedores', formData);
            setFormData({ nombre: '', telefono: '', email: '', direccion: '' }); // Limpiar formulario
            fetchProveedores(); // Recargar la lista
        } catch (error) {
            console.error("Error al crear el proveedor:", error);
            alert('Hubo un error al crear el proveedor.');
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader><CardTitle>Crear Nuevo Proveedor</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nombre">Nombre (Requerido)</Label>
                            <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="telefono">Teléfono</Label>
                            <Input id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="direccion">Dirección</Label>
                            <Input id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} />
                        </div>
                        <Button type="submit">Guardar Proveedor</Button>
                    </form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Proveedores Existentes</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Teléfono</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {proveedores.map(prov => (
                                <TableRow key={prov.id}>
                                    <TableCell className="font-medium">{prov.nombre}</TableCell>
                                    <TableCell>{prov.email}</TableCell>
                                    <TableCell>{prov.telefono}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}