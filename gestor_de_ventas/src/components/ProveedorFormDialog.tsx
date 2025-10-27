import { useState, useEffect } from 'react';
import api from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

// Interface
interface Proveedor {
    id: number;
    nombre: string;
    telefono?: string;
    email?: string;
    direccion?: string;
}

interface ProveedorFormDialogProps {
    proveedorToEdit: Proveedor | null;
    onSuccess: () => void;
}

export function ProveedorFormDialog({ proveedorToEdit, onSuccess }: ProveedorFormDialogProps) {
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        email: '',
        direccion: '',
    });

    useEffect(() => {
        if (proveedorToEdit) {
            setFormData({
                nombre: proveedorToEdit.nombre,
                telefono: proveedorToEdit.telefono || '',
                email: proveedorToEdit.email || '',
                direccion: proveedorToEdit.direccion || '',
            });
        } else {
            setFormData({ nombre: '', telefono: '', email: '', direccion: '' });
        }
    }, [proveedorToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nombre) return;
        try {
            if (proveedorToEdit) {
                await api.patch(`/proveedores/${proveedorToEdit.id}`, formData);
            } else {
                await api.post('/proveedores', formData);
            }
            onSuccess();
        } catch (error) {
            console.error("Error guardando el proveedor:", error);
        }
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{proveedorToEdit ? 'Editar Proveedor' : 'Crear Nuevo Proveedor'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2"><Label htmlFor="nombre">Nombre (Requerido)</Label><Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required /></div>
                    <div className="grid gap-2"><Label htmlFor="telefono">Teléfono</Label><Input id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} /></div>
                    <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} /></div>
                    <div className="grid gap-2"><Label htmlFor="direccion">Dirección</Label><Input id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} /></div>
                </div>
                <DialogFooter>
                    <Button type="submit">Guardar</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}