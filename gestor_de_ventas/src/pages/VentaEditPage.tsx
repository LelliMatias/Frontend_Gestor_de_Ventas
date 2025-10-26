import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { useToast } from "../hooks/use-toast";
import { Trash2 } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Textarea } from '../components/ui/textarea'; // Importa Textarea


// (Reutiliza las interfaces Producto y DetalleVentaItem)
interface Producto {
    id: number;
    nombre: string;
    precioUnitario: number; 
    stockActual: number;
}
interface DetalleVentaItem {
    productoId: number;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

export function VentaEditPage() {
    const { id: ventaId } = useParams(); // Obtiene el ID de la URL
    const navigate = useNavigate();
    const { toast } = useToast();
    
    // Estados
    const [productos, setProductos] = useState<Producto[]>([]);
    const [detalles, setDetalles] = useState<DetalleVentaItem[]>([]);
    const [motivo, setMotivo] = useState<string>(''); // ¡Nuevo! Para el historial

    // Estados de inputs
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [cantidad, setCantidad] = useState<number>(1);

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar productos Y la venta existente
    useEffect(() => {
        const fetchVentaData = async () => {
            if (!ventaId) return;
            setIsLoading(true);
            try {
                // 1. Cargar productos (activos)
                const resProductos = await api.get('/productos');
                setProductos(resProductos.data);

                // 2. Cargar la venta específica
                const resVenta = await api.get(`/venta/${ventaId}`);
                const venta = resVenta.data;
                
                if (venta.fecha_eliminacion) {
                    setError("No se puede editar una venta cancelada. Restáurala primero.");
                    setIsSubmitting(true); // Bloquea el botón de guardar
                    return;
                }

                // 3. Poblar el "carrito" (detalles) con los datos de la venta
                const detallesCargados = venta.detalles.map((d: any) => ({
                    productoId: d.producto.id,
                    nombre: d.producto.nombre,
                    cantidad: d.cantidad,
                    precio_unitario: parseFloat(d.precio_unitario),
                    subtotal: parseFloat(d.subtotal),
                }));
                setDetalles(detallesCargados);
                
            } catch (err) {
                setError("No se pudieron cargar los datos de la venta.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchVentaData();
    }, [ventaId]);

    // --- Lógica del Carrito (idéntica a VentaFormPage) ---
    const total = useMemo(() => {
        return detalles.reduce((acc, item) => acc + item.subtotal, 0);
    }, [detalles]);

    const handleAddDetalle = () => {
        setError(null);
        const numCantidad = Number(cantidad);
        if (!selectedProductId || numCantidad <= 0) return;
        
        const producto = productos.find(p => p.id === Number(selectedProductId));
        if (!producto) return;

        // --- TU "HACK" DE STOCK ---
        if (producto.stockActual <= 10) {
            toast({
                title: "Alerta de Stock Bajo",
                description: `Quedan ${producto.stockActual} unidades.`,
            });
        }
        
        const existing = detalles.find(d => d.productoId === producto.id);
        if (existing) {
            setDetalles(detalles.map(d => 
                d.productoId === producto.id
                    ? { ...d, cantidad: d.cantidad + numCantidad, subtotal: (d.cantidad + numCantidad) * d.precio_unitario }
                    : d
            ));
        } else {
            setDetalles([...detalles, {
                productoId: producto.id,
                nombre: producto.nombre,
                cantidad: numCantidad,
                precio_unitario: Number(producto.precioUnitario),
                subtotal: numCantidad * Number(producto.precioUnitario),
            }]);
        }
        setSelectedProductId('');
        setCantidad(1);
    };

    const handleRemoveDetalle = (productoId: number) => {
        setDetalles(detalles.filter(d => d.productoId !== productoId));
    };
    // --- Fin Lógica del Carrito ---


    const handleSubmitEdicion = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (detalles.length === 0) {
            setError("La venta no puede quedar sin productos.");
            return;
        }
        if (!motivo.trim()) {
            setError("Debes ingresar un motivo para la edición (requerido para el historial).");
            return;
        }

        setIsSubmitting(true);

        // DTO para el endpoint PATCH /venta/:id/detalles
        const updateVentaDetallesDto = {
            detalles: detalles.map(d => ({
                id_producto: d.productoId,
                cantidad: d.cantidad,
            })),
            motivo: motivo,
        };

        try {
            await api.patch(`/venta/${ventaId}/detalles`, updateVentaDetallesDto);
            
            toast({
                title: "¡Éxito!",
                description: "Venta actualizada correctamente. El stock ha sido ajustado.",
            });
            navigate('/gestion/ventas'); // Volver a la lista
            
        // --- INICIO DE LA CORRECCIÓN ---
        } catch (err: any) { // Se borró el "Venta" y se añadieron llaves
            const errorMsg = err.response?.data?.message || "No se pudo actualizar la venta.";
            setError(errorMsg);
            toast({
                title: "Error al actualizar",
                description: errorMsg,
                variant: "destructive",
            });
        // --- FIN DE LA CORRECCIÓN ---
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-4">Cargando datos de la venta...</div>;

    return (
        <form onSubmit={handleSubmitEdicion}>
            <div className="flex justify-between items-center mb-4">
                 <h1 className="text-2xl font-bold">Editar Venta #{ventaId}</h1>
                 <Button type="button" variant="outline" asChild>
                    <Link to="/gestion/ventas">Volver a la lista</Link>
                 </Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
                {/* Columna 1: Agregar Productos (idéntica) */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader><CardTitle>Agregar/Quitar Productos</CardTitle></CardHeader>
                    <CardContent className="grid gap-4">
                         <div className="grid gap-2">
                            <Label htmlFor="producto">Producto</Label>
                            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                <SelectTrigger id="producto">
                                    <SelectValue placeholder="Selecciona un producto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {productos.map(p => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.nombre} (${Number(p.precioUnitario).toFixed(2)}) - Stock: {p.stockActual}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cantidad">Cantidad</Label>
                            <Input 
                                id="cantidad" 
                                type="number" 
                                min="1" 
                                value={cantidad} 
                                onChange={e => setCantidad(Number(e.target.value))} 
                            />
                        </div>
                        <Button type="button" onClick={handleAddDetalle}>
                            Añadir/Actualizar
                        </Button>
                    </CardContent>
                </Card>

                {/* Columna 2: Resumen de Venta (con campo Motivo) */}
                <Card className="md:col-span-2">
                    <CardHeader><CardTitle>Resumen de Venta</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Cantidad</TableHead>
                                    <TableHead>P. Unitario</TableHead>
                                    <TableHead>Subtotal</TableHead>
                                    <TableHead>Acción</TableHead>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {detalles.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">Aún no hay productos.</TableCell>
                                </TableRow>
                                )}
                                {detalles.map(item => (
                                <TableRow key={item.productoId}>
                                    <TableCell className="font-medium">{item.nombre}</TableCell>
                                    <TableCell>{item.cantidad}</TableCell>
                                    <TableCell>${item.precio_unitario.toFixed(2)}</TableCell>
                                    <TableCell>${item.subtotal.toFixed(2)}</TableCell>
                                    <TableCell>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveDetalle(item.productoId)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-4">
                         {/* --- CAMPO MOTIVO (NUEVO) --- */}
                         <div className="grid gap-2 w-full">
                            <Label htmlFor="motivo">Motivo de la Edición (Requerido)</Label>
                            <Textarea
                                id="motivo"
                                placeholder="Ej: Cliente cambió 2u de Producto A por 1u de Producto B..."
                                value={motivo}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMotivo(e.target.value)}
                            />
                        </div>

                        {error && (
                            <Alert variant="destructive" className="w-full">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="flex justify-between items-center w-full">
                            <h3 className="text-xl font-bold">Nuevo Total: ${total.toFixed(2)}</h3>
                            <Button type="submit" size="lg" disabled={isSubmitting}>
                                {isSubmitting ? "Guardando Cambios..." : "Guardar Cambios"}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </form>
    );
}