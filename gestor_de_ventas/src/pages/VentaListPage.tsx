import { useEffect, useState } from 'react';
import api from '../services/api'; // Tu servicio API
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { Trash2, Undo, Edit, History, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
// Importa el Dialog de Historial que crearemos
import { HistorialVentaDialog } from '../components/HistorialVentaDialog';

// Interfaces de la API
interface Venta {
    id_venta: number;
    fecha_creacion: string;
    total: number;
    usuario: { nombre: string };
    detalles: any[];
    fecha_eliminacion: string | null;
}

export function VentaListPage() {
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    
    // Estado para saber qué historial mostrar
    const [historialVentaId, setHistorialVentaId] = useState<number | null>(null);

    const fetchVentas = async () => {
        setIsLoading(true);
        try {
            // Usamos el endpoint que trae activas y borradas
            const res = await api.get('/venta/con-borradas');
            setVentas(res.data);
        } catch (error) {
            toast({ title: "Error", description: "No se pudieron cargar las ventas", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar ventas al montar la página
    useEffect(() => {
        fetchVentas();
    }, []);

    const handleSoftDelete = async (id: number) => {
        try {
            await api.delete(`/venta/${id}`);
            toast({ title: "Venta Cancelada", description: "La venta ha sido movida a la papelera. (Sin ajuste de stock)" });
            fetchVentas(); // Recargar la lista
        } catch (err: any) {
            toast({ title: "Error", description: err.response?.data?.message || "No se pudo cancelar.", variant: "destructive" });
        }
    };
    
    const handleRestore = async (id: number) => {
         try {
            await api.post(`/venta/${id}/restore`);
            toast({ title: "Venta Restaurada", description: "La venta ha sido restaurada. (Sin ajuste de stock)." });
            fetchVentas(); // Recargar la lista
        } catch (err: any) {
            toast({ title: "Error", description: err.response?.data?.message || "No se pudo restaurar.", variant: "destructive" });
        }
    };

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Gestión de Ventas</CardTitle>
                        <Button asChild>
                            <Link to="/gestion/ventas/nueva">
                                <PlusCircle className="mr-2 h-4 w-4" /> Crear Venta
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Vendedor</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && <TableRow><TableCell colSpan={6} className="text-center">Cargando...</TableCell></TableRow>}
                            {!isLoading && ventas.length === 0 && (
                                <TableRow><TableCell colSpan={6} className="text-center">No se encontraron ventas.</TableCell></TableRow>
                            )}
                            {ventas.map(v => (
                                <TableRow key={v.id_venta}>
                                    <TableCell className="font-medium">#{v.id_venta}</TableCell>
                                    <TableCell>{new Date(v.fecha_creacion).toLocaleString()}</TableCell>
                                    <TableCell>{v.usuario?.nombre || 'N/A'}</TableCell>
                                    <TableCell>${Number(v.total).toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={v.fecha_eliminacion ? "destructive" : "success"}>
                                            {v.fecha_eliminacion ? "Cancelada" : "Activa"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="flex gap-1 justify-end">
                                        {v.fecha_eliminacion ? (
                                            // --- ACCIÓN DE RESTAURAR ---
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" size="icon" title="Restaurar"><Undo className="h-4 w-4" /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Restaurar Venta #{v.id_venta}?</AlertDialogTitle></AlertDialogHeader>
                                                    <AlertDialogDescription>
                                                        Esta acción restaurará la venta. (Sin ajuste de stock).
                                                    </AlertDialogDescription>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleRestore(v.id_venta)}>Confirmar Restauración</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        ) : (
                                            // --- ACCIONES PARA VENTAS ACTIVAS ---
                                            <>
                                                <Button variant="outline" size="icon" title="Ver Historial" onClick={() => setHistorialVentaId(v.id_venta)}>
                                                    <History className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" title="Editar Detalles" asChild>
                                                    <Link to={`/gestion/ventas/editar/${v.id_venta}`}><Edit className="h-4 w-4" /></Link>
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="icon" title="Cancelar Venta"><Trash2 className="h-4 w-4" /></Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Cancelar Venta #{v.id_venta}?</AlertDialogTitle></AlertDialogHeader>
                                                        <AlertDialogDescription>
                                                            Esta acción cancelará la venta. (Sin ajuste de stock).
                                                        </AlertDialogDescription>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cerrar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleSoftDelete(v.id_venta)}>Confirmar Cancelación</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Renderiza el Dialog de Historial cuando historialVentaId tiene un número */}
            {historialVentaId && (
                <HistorialVentaDialog 
                    ventaId={historialVentaId} 
                    onOpenChange={() => setHistorialVentaId(null)} 
                />
            )}
        </>
    );
}