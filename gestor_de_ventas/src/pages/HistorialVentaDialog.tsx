import { useEffect, useState } from 'react';
import api from '../services/api';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../components/ui/dialog";
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area'

// Interfaces (puedes moverlas a @/types)
interface Historial {
    id: number;
    accion: 'CREACION' | 'MODIFICACION' | 'CANCELACION' | 'RESTAURACION';
    motivo: string | null;
    datos_anteriores: any | null;
    datos_nuevos: any | null;
    fecha: string;
    usuario: { nombre: string };
}

interface Props {
    ventaId: number;
    onOpenChange: (open: boolean) => void;
}

export function HistorialVentaDialog({ ventaId, onOpenChange }: Props) {
    const [historial, setHistorial] = useState<Historial[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistorial = async () => {
            setIsLoading(true);
            try {
                const res = await api.get(`/venta/${ventaId}/historial`);
                setHistorial(res.data);
            } catch (error) {
                console.error("Error al cargar historial", error);
                // Aquí podrías usar un toast si lo prefieres
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistorial();
    }, [ventaId]);

    const getBadgeVariant = (accion: Historial['accion']) => {
        switch (accion) {
            case 'CREACION': return 'success';
            case 'MODIFICACION': return 'default';
            case 'CANCELACION': return 'destructive';
            case 'RESTAURACION': return 'outline';
            default: return 'secondary';
        }
    }

    return (
        <Dialog open={true} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Historial de Venta #{ventaId}</DialogTitle>
                    <DialogDescription>Muestra todos los cambios realizados en esta venta.</DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-6">
                        {isLoading && <p>Cargando historial...</p>}
                        {!isLoading && historial.length === 0 && <p>No hay historial para esta venta.</p>}

                        {historial.map((h) => (
                            <div key={h.id} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <Badge variant={getBadgeVariant(h.accion)}>{h.accion}</Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(h.fecha).toLocaleString()} por {h.usuario.nombre}
                                    </span>
                                </div>
                                {h.motivo && <p className="text-sm italic text-muted-foreground mb-2">Motivo: "{h.motivo}"</p>}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1">Datos Anteriores</h4>
                                        <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                                            {h.datos_anteriores ? JSON.stringify(h.datos_anteriores, null, 2) : 'N/A'}
                                        </pre>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1">Datos Nuevos</h4>
                                        <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                                            {h.datos_nuevos ? JSON.stringify(h.datos_nuevos, null, 2) : 'N/A'}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}