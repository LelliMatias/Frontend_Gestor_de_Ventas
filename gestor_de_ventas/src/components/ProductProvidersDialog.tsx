import { useState, useEffect } from 'react';
import api from '../services/api';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import type { Product } from '../pages/ProductPage';

// --- OTRAS INTERFACES ---
interface Proveedor { id: number; nombre: string; }
interface ProveedorAsociado {
    proveedorId: number;
    precioCompra: number | string;
    codigoProveedor?: string;
}

interface ProductProvidersDialogProps {
    product: Product;
    onSuccess: () => void;
}

export function ProductProvidersDialog({ product, onSuccess }: ProductProvidersDialogProps) {
    const [allProviders, setAllProviders] = useState<Proveedor[]>([]);
    const [associatedProviders, setAssociatedProviders] = useState<Map<number, ProveedorAsociado>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        Promise.all([
            api.get<Proveedor[]>('/proveedores'),
            api.get<ProveedorAsociado[]>(`/productos/${product.id}/proveedores`),
        ]).then(([allProvidersRes, associatedRes]) => {
            setAllProviders(allProvidersRes.data);
            const associatedMap = new Map<number, ProveedorAsociado>();
            associatedRes.data.forEach(assoc => {
                associatedMap.set(assoc.proveedorId, assoc);
            });
            setAssociatedProviders(associatedMap);
        }).catch(err => {
            console.error("Error al cargar datos de proveedores:", err);
            setError("No se pudieron cargar los datos. Inténtalo de nuevo.");
        }).finally(() => setLoading(false));
    }, [product.id]);

    const handleProviderToggle = (provider: Proveedor) => {
        const newMap = new Map(associatedProviders);
        if (newMap.has(provider.id)) {
            newMap.delete(provider.id);
        } else {
            newMap.set(provider.id, {
                proveedorId: provider.id,
                precioCompra: '',
                codigoProveedor: '',
            });
        }
        setAssociatedProviders(newMap);
    };

    const handleAssociationChange = (proveedorId: number, field: 'precioCompra' | 'codigoProveedor', value: string) => {
        const newMap = new Map(associatedProviders);
        const association = newMap.get(proveedorId);
        if (association) {
            newMap.set(proveedorId, { ...association, [field]: value });
            setAssociatedProviders(newMap);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const proveedoresPayload = Array.from(associatedProviders.values()).map(assoc => {
                const precio = parseFloat(assoc.precioCompra as string);
                if (isNaN(precio) || precio <= 0) {
                    throw new Error(`El precio de compra para el proveedor "${allProviders.find(p => p.id === assoc.proveedorId)?.nombre}" debe ser un número positivo.`);
                }
                return {
                    proveedorId: assoc.proveedorId,
                    precioCompra: precio,
                    codigoProveedor: assoc.codigoProveedor
                };
            });

            const payload = {
                proveedores: proveedoresPayload,
            };

            await api.put(`/productos/${product.id}/proveedores`, payload);
            alert('Proveedores actualizados con éxito');
            onSuccess();
        } catch (error: any) {
            console.error("Error al actualizar proveedores", error);
            alert(error.message || 'Hubo un error al guardar los cambios.');
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        if (loading) return <p className="py-4">Cargando proveedores...</p>;
        if (error) return <p className="py-4 text-destructive">{error}</p>;
        if (allProviders.length === 0) return <p className="py-4 text-muted-foreground">No hay proveedores registrados. Ve a la sección de "Proveedores" para añadirlos.</p>;

        return (
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                {allProviders.map(provider => (
                    <div key={provider.id} className="space-y-2 rounded-md border p-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox id={`provider-${provider.id}`} checked={associatedProviders.has(provider.id)} onCheckedChange={() => handleProviderToggle(provider)} />
                            <Label htmlFor={`provider-${provider.id}`}>{provider.nombre}</Label>
                        </div>
                        {associatedProviders.has(provider.id) && (
                            <div className="grid grid-cols-2 gap-4 pl-6 pt-2">
                                <div className="space-y-1"><Label>Precio de Compra</Label><Input type="number" step="0.01" value={associatedProviders.get(provider.id)?.precioCompra} onChange={(e) => handleAssociationChange(provider.id, 'precioCompra', e.target.value)} /></div>
                                <div className="space-y-1"><Label>Código del Proveedor</Label><Input value={associatedProviders.get(provider.id)?.codigoProveedor} onChange={(e) => handleAssociationChange(provider.id, 'codigoProveedor', e.target.value)} /></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <DialogContent className="sm:max-w-[625px]">
            <DialogHeader><DialogTitle>Asignar Proveedores a: {product.nombre}</DialogTitle></DialogHeader>
            {renderContent()}
            <DialogFooter><Button onClick={handleSubmit} disabled={loading || allProviders.length === 0}>{loading ? 'Guardando...' : 'Guardar Cambios'}</Button></DialogFooter>
        </DialogContent>
    );
}