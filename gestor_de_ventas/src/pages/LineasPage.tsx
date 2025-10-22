import { useState, useEffect } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

// Asumimos que ya tienes estas interfaces definidas
interface Marca { id: number; nombre: string; }
interface Linea { id: number; nombre: string; descripcion: string; marca: Marca; }

export function LineasPage() {
    const [lineas, setLineas] = useState<Linea[]>([]);
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [formData, setFormData] = useState({ nombre: '', descripcion: '', id_marca: '' });

    const fetchLineas = () => api.get<Linea[]>('/lineas').then(res => setLineas(res.data));
    const fetchMarcas = () => api.get<Marca[]>('/marcas').then(res => setMarcas(res.data));

    useEffect(() => {
        fetchLineas();
        fetchMarcas();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, id_marca: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/lineas', {
                ...formData,
                id_marca: parseInt(formData.id_marca),
            });
            setFormData({ nombre: '', descripcion: '', id_marca: '' });
            fetchLineas();
        } catch (error) {
            console.error("Error al crear la línea:", error);
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader><CardTitle>Crear Nueva Línea</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Marca</Label>
                            <Select value={formData.id_marca} onValueChange={handleSelectChange} required>
                                <SelectTrigger><SelectValue placeholder="Selecciona una marca" /></SelectTrigger>
                                <SelectContent>
                                    {marcas.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.nombre}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="nombre">Nombre de la Línea</Label>
                            <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="descripcion">Descripción (Opcional)</Label>
                            <Input id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} />
                        </div>
                        <Button type="submit">Guardar Línea</Button>
                    </form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Líneas Existentes</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Nombre</TableHead><TableHead>Marca</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {lineas.map(linea => (
                                <TableRow key={linea.id}>
                                    <TableCell>{linea.id}</TableCell>
                                    <TableCell className="font-medium">{linea.nombre}</TableCell>
                                    <TableCell>{linea.marca.nombre}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}