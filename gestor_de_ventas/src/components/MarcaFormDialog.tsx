import { useState, useEffect } from 'react';
import api from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

interface Marca { id: number; nombre: string; }
interface MarcaFormDialogProps {
    marcaToEdit: Marca | null;
    onSuccess: () => void;
}

export function MarcaFormDialog({ marcaToEdit, onSuccess }: MarcaFormDialogProps) {
    const [nombre, setNombre] = useState('');

    useEffect(() => {
        setNombre(marcaToEdit ? marcaToEdit.nombre : '');
    }, [marcaToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre) return;
        try {
            if (marcaToEdit) {
                await api.patch(`/marcas/${marcaToEdit.id}`, { nombre });
            } else {
                await api.post('/marcas', { nombre });
            }
            onSuccess();
        } catch (error) {
            console.error("Error guardando la marca:", error);
        }
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{marcaToEdit ? 'Editar Marca' : 'Crear Nueva Marca'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                    <Label htmlFor="nombre">Nombre de la Marca</Label>
                    <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                </div>
                <DialogFooter>
                    <Button type="submit">Guardar</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}