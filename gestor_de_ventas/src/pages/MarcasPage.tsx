import { useState, useEffect } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

interface Marca {
    id: number;
    nombre: string;
}

export function MarcasPage() {
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [nombre, setNombre] = useState('');

    const fetchMarcas = () => {
        api.get<Marca[]>('/marcas').then(res => setMarcas(res.data));
    };

    useEffect(fetchMarcas, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre) return;
        try {
            await api.post('/marcas', { nombre });
            setNombre('');
            fetchMarcas(); // Recargar la lista
        } catch (error) {
            console.error("Error al crear la marca:", error);
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader><CardTitle>Crear Nueva Marca</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nombre-marca">Nombre</Label>
                            <Input id="nombre-marca" value={nombre} onChange={e => setNombre(e.target.value)} required />
                        </div>
                        <Button type="submit">Guardar Marca</Button>
                    </form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Marcas Existentes</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Nombre</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {marcas.map(marca => (
                                <TableRow key={marca.id}>
                                    <TableCell>{marca.id}</TableCell>
                                    <TableCell className="font-medium">{marca.nombre}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}