import { useState, useEffect } from 'react';
import api from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// Interfaces
interface Marca { id: number; nombre: string; }
interface Linea { id: number; nombre: string; descripcion?: string; marca: Marca; }

interface LineaFormDialogProps {
    lineaToEdit: Omit<Linea, 'marca'> & { marca: { id: number } } | null;
    onSuccess: () => void;
}

export function LineaFormDialog({ lineaToEdit, onSuccess }: LineaFormDialogProps) {
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        id_marca: '',
    });

    useEffect(() => {
        // Cargar todas las marcas para el selector
        api.get<Marca[]>('/marcas').then(res => setMarcas(res.data));

        // Si estamos editando, rellenar el formulario
        if (lineaToEdit) {
            setFormData({
                nombre: lineaToEdit.nombre,
                descripcion: lineaToEdit.descripcion || '',
                id_marca: String(lineaToEdit.marca.id),
            });
        } else {
            // Limpiar para una nueva entrada
            setFormData({ nombre: '', descripcion: '', id_marca: '' });
        }
    }, [lineaToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, id_marca: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nombre || !formData.id_marca) return;

        const payload = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            id_marca: parseInt(formData.id_marca),
        };

        try {
            if (lineaToEdit) {
                await api.patch(`/lineas/${lineaToEdit.id}`, payload);
            } else {
                await api.post('/lineas', payload);
            }
            onSuccess();
        } catch (error) {
            console.error("Error guardando la línea:", error);
        }
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{lineaToEdit ? 'Editar Línea' : 'Crear Nueva Línea'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
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
                </div>
                <DialogFooter>
                    <Button type="submit">Guardar</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}