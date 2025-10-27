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
import { useNavigate } from 'react-router-dom';

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

export function VentaFormPage() {
    const { toast } = useToast();
    const navigate = useNavigate();

    const [productos, setProductos] = useState<Producto[]>([]);
    const [detalles, setDetalles] = useState<DetalleVentaItem[]>([]);

    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [cantidad, setCantidad] = useState<number>(1);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar productos al montar
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const res = await api.get('/productos');
                setProductos(res.data);
            } catch (err) {
                setError("No se pudieron cargar los productos.");
            }
        };
        fetchProductos();
    }, []);

    const total = useMemo(() => {
        return detalles.reduce((acc, item) => acc + item.subtotal, 0);
    }, [detalles]);

    const handleAddDetalle = () => {
        setError(null);
        if (!selectedProductId || cantidad <= 0) return;

        const numCantidad = Number(cantidad);
        const producto = productos.find(p => p.id === Number(selectedProductId));
        if (!producto) return;

        if (producto.stockActual <= 10) {
            toast({
                title: "Alerta de Stock Bajo",
                description: `Quedan ${producto.stockActual} unidades de "${producto.nombre}".`,
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

    const handleSubmitVenta = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (detalles.length === 0) {
            setError("La venta no tiene productos.");
            return;
        }

        setIsLoading(true);

        const createVentaDto = {
            detalles: detalles.map(d => ({
                id_producto: d.productoId,
                cantidad: d.cantidad,
            })),
        };

        try {
            await api.post('/venta', createVentaDto);
            toast({ title: "¡Éxito!", description: "Venta registrada correctamente." });
            navigate('/gestion/ventas');
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "No se pudo registrar la venta.";
            setError(errorMsg);
            toast({ title: "Error al registrar la venta", description: errorMsg, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Nueva Venta</h1>
                <p className="text-muted-foreground">Selecciona productos y añádelos al carrito para registrar una nueva venta.</p>
            </div>
            <form onSubmit={handleSubmitVenta}>
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Columna 1: Agregar Productos */}
                    <Card className="md:col-span-1 h-fit">
                        <CardHeader>
                            <CardTitle>Añadir Productos</CardTitle>
                            <CardDescription>Busca y añade productos a la venta actual.</CardDescription>
                        </CardHeader>
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
                            <Button type="button" onClick={handleAddDetalle} className="w-full">
                                Agregar a la Venta
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Columna 2: Resumen de Venta */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Resumen de Venta</CardTitle>
                            <CardDescription>Productos actualmente en el carrito.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Producto</TableHead>
                                        <TableHead>Cantidad</TableHead>
                                        <TableHead>P. Unitario</TableHead>
                                        <TableHead>Subtotal</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {detalles.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24">El carrito está vacío.</TableCell>
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
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter className="flex flex-col items-stretch gap-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="flex justify-between items-center w-full pt-4 border-t">
                                <h3 className="text-xl font-bold">Total: ${total.toFixed(2)}</h3>
                                <Button type="submit" size="lg" disabled={isLoading}>
                                    {isLoading ? "Registrando..." : "Confirmar Venta"}
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </form>
        </div>
    );
}