import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogTrigger } from '../components/ui/dialog';
import { MarcaFormDialog } from '../components/MarcaFormDialog';
import { Input } from '../components/ui/input';
import { PlusCircle } from 'lucide-react';

interface Marca {
    id: number;
    nombre: string;
}

export function MarcasPage() {
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [marcaToEdit, setMarcaToEdit] = useState<Marca | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchMarcas = () => {
        api.get<Marca[]>('/marcas').then(res => setMarcas(res.data));
    };

    useEffect(() => {
        fetchMarcas();
    }, []);

    const filteredMarcas = useMemo(() => {
        if (!searchTerm) {
            return marcas;
        }
        return marcas.filter(marca =>
            marca.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [marcas, searchTerm]);

    const handleSuccess = () => {
        setIsFormOpen(false);
        fetchMarcas();
    };

    const handleDelete = async (marcaId: number) => {
        if (window.confirm("¿Estás seguro? Al eliminar esta marca, todas sus líneas asociadas también serán eliminadas.")) {
            try {
                await api.delete(`/marcas/${marcaId}`);
                fetchMarcas();
            } catch (error) {
                alert("No se pudo eliminar la marca. Es posible que tenga productos asociados.");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Marcas</h1>
                    <p className="text-muted-foreground">Crea, busca y administra las marcas de tus productos.</p>
                </div>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setMarcaToEdit(null)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nueva Marca
                        </Button>
                    </DialogTrigger>
                    <MarcaFormDialog marcaToEdit={marcaToEdit} onSuccess={handleSuccess} />
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <Input
                        placeholder="Buscar por nombre de marca..."
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
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMarcas.map(marca => (
                                <TableRow key={marca.id}>
                                    <TableCell className="font-medium">{marca.nombre}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => { setMarcaToEdit(marca); setIsFormOpen(true); }}>
                                            Editar
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(marca.id)}>
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