import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogTrigger } from '../components/ui/dialog';
import { LineaFormDialog } from '../components/LineaFormDialog';
import { Input } from '../components/ui/input'; // <-- Importar Input

interface Marca { id: number; nombre: string; }
interface Linea { id: number; nombre: string; descripcion?: string; marca: Marca; }

export function LineasPage() {
    const [lineas, setLineas] = useState<Linea[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [lineToEdit, setlineToEdit] = useState<Linea | null>(null);
    const [searchTerm, setSearchTerm] = useState(''); // <-- Estado para el buscador

    const fetchLineas = () => api.get<Linea[]>('/lineas').then(res => setLineas(res.data));

    useEffect(() => {
        fetchLineas();
    }, []);

    // Filtra las líneas por nombre de línea o nombre de marca
    const filteredLineas = useMemo(() => {
        if (!searchTerm) {
            return lineas;
        }
        return lineas.filter(linea =>
            linea.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            linea.marca.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [lineas, searchTerm]);

    const handleSuccess = () => {
        setIsFormOpen(false);
        fetchLineas();
    };

    const handleDelete = async (lineaId: number) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar esta línea?")) {
            try {
                await api.delete(`/lineas/${lineaId}`);
                fetchLineas();
            } catch (error: any) {
                alert(`No se pudo eliminar la línea. Error: ${error.response?.data?.message || 'Conflicto de datos.'}`);
            }
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gestión de Líneas</CardTitle>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setlineToEdit(null)}>Nueva Línea</Button>
                    </DialogTrigger>
                    <LineaFormDialog lineaToEdit={lineToEdit} onSuccess={handleSuccess} />
                </Dialog>
            </CardHeader>
            <CardContent>
                {/* --- BARRA DE BÚSQUEDA AÑADIDA --- */}
                <div className="mb-4">
                    <Input
                        placeholder="Buscar por línea o marca..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
                {/* --- FIN DE BARRA DE BÚSQUEDA --- */}

                <Table>
                    <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Marca</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {filteredLineas.map(linea => ( // <-- Usar la lista filtrada
                            <TableRow key={linea.id}>
                                <TableCell className="font-medium">{linea.nombre}</TableCell>
                                <TableCell>{linea.marca.nombre}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => { setlineToEdit(linea); setIsFormOpen(true); }}>
                                        Editar
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(linea.id)}>
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