import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogTrigger } from '../components/ui/dialog';
import { MarcaFormDialog } from '../components/MarcaFormDialog';
import { Input } from '../components/ui/input'; // <-- Importar Input

interface Marca { id: number; nombre: string; }

export function MarcasPage() {
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [marcaToEdit, setMarcaToEdit] = useState<Marca | null>(null);
    const [searchTerm, setSearchTerm] = useState(''); // <-- Estado para el buscador

    const fetchMarcas = () => api.get<Marca[]>('/marcas').then(res => setMarcas(res.data));

    useEffect(() => {
        fetchMarcas();
    }, []);

    // Filtra las marcas basándose en el término de búsqueda
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
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gestión de Marcas</CardTitle>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setMarcaToEdit(null)}>Nueva Marca</Button>
                    </DialogTrigger>
                    <MarcaFormDialog marcaToEdit={marcaToEdit} onSuccess={handleSuccess} />
                </Dialog>
            </CardHeader>
            <CardContent>
                {/* --- BARRA DE BÚSQUEDA AÑADIDA --- */}
                <div className="mb-4">
                    <Input
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
                {/* --- FIN DE BARRA DE BÚSQUEDA --- */}

                <Table>
                    <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {filteredMarcas.map(marca => ( // <-- Usar la lista filtrada
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
    );
}