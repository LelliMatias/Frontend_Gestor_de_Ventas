import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { useToast } from "../hooks/use-toast";
import { Trash2 } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Textarea } from '../components/ui/textarea';

// Interfaces
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
    const { id: ventaId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Estados
    const [productos, setProductos] = useState<Producto[]>([]);
    const [detalles, setDetalles] = useState<DetalleVentaItem[]>([]);
    const [motivo, setMotivo] = useState<string>('');

    // Estados de inputs
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [cantidad, setCantidad] = useState<number>(1);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar productos y la venta existente
    useEffect(() => {
        const fetchVentaData = async () => {
            if (!ventaId) return;
            setIsLoading(true);
            try {
                const resProductos = await api.get('/productos');
                setProductos(resProductos.data);

                const resVenta = await api.get(`/venta/${ventaId}`);
                const venta = resVenta.data;

                if (venta.fecha_eliminacion) {
                    setError("No se puede editar una venta cancelada. Restáurala primero.");
                    setIsSubmitting(true);
                    return;
                }

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

    const total = useMemo(() => {
        return detalles.reduce((acc, item) => acc + item.subtotal, 0);
    }, [detalles]);

    const handleAddDetalle = () => {
        // ... (La lógica interna de esta función no necesita cambios)
        setError(null);
        const numCantidad = Number(cantidad);
        if (!selectedProductId || numCantidad <= 0) return;
        const producto = productos.find(p => p.id === Number(selectedProductId));
        if (!producto) return;
        if (producto.stockActual < numCantidad) {
            toast({ title: "Stock Insuficiente", description: `Solo quedan ${producto.stockActual} unidades.` });
            return;
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
            navigate('/gestion/ventas');

        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "No se pudo actualizar la venta.";
            setError(errorMsg);
            toast({ title: "Error al actualizar", description: errorMsg, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Cargando datos de la venta...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Editar Venta #{ventaId}</h1>
                    <p className="text-muted-foreground">Modifica los productos del carrito y guarda los cambios.</p>
                </div>
                <Button type="button" variant="outline" asChild>
                    <Link to="/gestion/ventas">Volver a la lista</Link>
                </Button>
            </div>

            <form onSubmit={handleSubmitEdicion}>
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Columna 1: Agregar Productos */}
                    <Card className="md:col-span-1 h-fit">
                        <CardHeader>
                            <CardTitle>Modificar Productos</CardTitle>
                            <CardDescription>Añade, actualiza o quita productos de la venta.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="producto">Producto</Label>
                                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                    <SelectTrigger id="producto"><SelectValue placeholder="Selecciona un producto" /></SelectTrigger>
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
                                <Input id="cantidad" type="number" min="1" value={cantidad} onChange={e => setCantidad(Number(e.target.value))} />
                            </div>
                            <Button type="button" onClick={handleAddDetalle} className="w-full">Añadir/Actualizar</Button>
                        </CardContent>
                    </Card>

                    {/* Columna 2: Resumen de Venta */}
                    <Card className="md:col-span-2">
                        <CardHeader><CardTitle>Resumen de Venta</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Producto</TableHead><TableHead>Cantidad</TableHead><TableHead>P. Unitario</TableHead><TableHead>Subtotal</TableHead><TableHead className="w-[50px]"></TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {detalles.length === 0 && (
                                        <TableRow><TableCell colSpan={5} className="text-center h-24">Aún no hay productos.</TableCell></TableRow>
                                    )}
                                    {detalles.map(item => (
                                        <TableRow key={item.productoId}>
                                            <TableCell className="font-medium">{item.nombre}</TableCell>
                                            <TableCell>{item.cantidad}</TableCell>
                                            <TableCell>${item.precio_unitario.toFixed(2)}</TableCell>
                                            <TableCell>${item.subtotal.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveDetalle(item.productoId)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter className="flex flex-col items-stretch gap-4 pt-6 border-t">
                            <div className="grid gap-2 w-full">
                                <Label htmlFor="motivo">Motivo de la Edición (Requerido)</Label>
                                <Textarea id="motivo" placeholder="Ej: Cliente cambió un producto..." value={motivo} onChange={(e) => setMotivo(e.target.value)} />
                            </div>
                            {error && (
                                <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
                            )}
                            <div className="flex justify-between items-center w-full pt-4 border-t">
                                <h3 className="text-xl font-bold">Nuevo Total: ${total.toFixed(2)}</h3>
                                <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? "Guardando..." : "Guardar Cambios"}</Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </form>
        </div>
    );
}