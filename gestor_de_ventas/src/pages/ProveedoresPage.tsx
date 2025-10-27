import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogTrigger } from '../components/ui/dialog';
import { ProveedorFormDialog } from '../components/ProveedorFormDialog';
import { Input } from '../components/ui/input';
import { PlusCircle } from 'lucide-react';

interface Proveedor {
    id: number;
    nombre: string;
    telefono?: string;
    email?: string;
    direccion?: string;
}

export function ProveedoresPage() {
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [proveedorToEdit, setProveedorToEdit] = useState<Proveedor | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProveedores = () => api.get<Proveedor[]>('/proveedores').then(res => setProveedores(res.data));

    useEffect(() => {
        fetchProveedores();
    }, []);

    const filteredProveedores = useMemo(() => {
        if (!searchTerm) {
            return proveedores;
        }
        return proveedores.filter(p =>
            p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.telefono && p.telefono.includes(searchTerm))
        );
    }, [proveedores, searchTerm]);

    const handleSuccess = () => {
        setIsFormOpen(false);
        fetchProveedores();
    };

    const handleDelete = async (proveedorId: number) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este proveedor?")) {
            try {
                await api.delete(`/proveedores/${proveedorId}`);
                fetchProveedores();
            } catch (error: any) {
                alert(`No se pudo eliminar. Error: ${error.response?.data?.message || 'Error desconocido.'}`);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Proveedores</h1>
                    <p className="text-muted-foreground">Añade, busca y administra los proveedores de tus productos.</p>
                </div>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setProveedorToEdit(null)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nuevo Proveedor
                        </Button>
                    </DialogTrigger>
                    <ProveedorFormDialog proveedorToEdit={proveedorToEdit} onSuccess={handleSuccess} />
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <Input
                        placeholder="Buscar por nombre, email o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProveedores.map(prov => (
                                <TableRow key={prov.id}>
                                    <TableCell className="font-medium">{prov.nombre}</TableCell>
                                    <TableCell>{prov.email}</TableCell>
                                    <TableCell>{prov.telefono}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => { setProveedorToEdit(prov); setIsFormOpen(true); }}>
                                            Editar
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(prov.id)}>
                                            Eliminar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}