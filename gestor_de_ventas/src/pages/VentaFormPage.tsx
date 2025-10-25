import { useState, useEffect, useMemo } from 'react';
// --- CORRECCIÓN: Usar alias '@/' para las importaciones ---
import api from '../services/api'; // Tu servicio API
import { cn } from '../lib/utils'; // Tu utilidad cn

// Componentes Shadcn
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
// --- CORRECCIÓN: useToast se importa desde 'toaster' ---
import { useToast } from "../hooks/use-toast";
import { Trash2 } from 'lucide-react'; // Icono para eliminar/pages/VentaFormPage

// --- Interfaces ---
// Interfaz para el producto (lo que recibimos de GET /productos)
interface Producto {
    id: number;
    nombre: string;
    precio_unitario: number; // Tu VentaService usa 'precioUnitario'
    stock_actual: number;    // Tu VentaService usa 'stockActual'
}

// Interfaz para el item del carrito (estado local)
interface DetalleVentaItem {
    productoId: number;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

export function VentaFormPage() {
    const { toast } = useToast();
    
    // Estado para la lista de productos disponibles
    const [productos, setProductos] = useState<Producto[]>([]);
    
    // Estado para el "carrito" (detalles de la venta)
    const [detalles, setDetalles] = useState<DetalleVentaItem[]>([]);
    
    // Estado para los inputs del formulario
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [cantidad, setCantidad] = useState<number>(1);

    // Estados de UI
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar productos al montar el componente
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                // Asumo que tu endpoint de productos es /productos
                // y que devuelve { id, nombre, precioUnitario, stockActual }
                const res = await api.get('/productos');
                
                // Renombramos para coincidir con el frontend si es necesario
                const productosAdaptados = res.data.map((p: any) => ({
                    id: p.id,
                    nombre: p.nombre,
                    precio_unitario: parseFloat(p.precio_unitario || p.precioUnitario),
                    stock_actual: parseInt(p.stock_actual || p.stockActual, 10)
                }));
                setProductos(productosAdaptados);

            } catch (err) {
                console.error("Error al cargar productos:", err);
                setError("No se pudieron cargar los productos.");
            }
        };
        fetchProductos();
    }, []);

    // Calcular el total (solo para mostrar en el frontend)
    const total = useMemo(() => {
        return detalles.reduce((acc, item) => acc + item.subtotal, 0);
    }, [detalles]);

    // --- Manejadores de Eventos ---

    const handleAddDetalle = () => {
        setError(null);
        if (!selectedProductId || cantidad <= 0) {
            setError("Selecciona un producto y una cantidad válida.");
            return;
        }

        const numCantidad = Number(cantidad);
        const producto = productos.find(p => p.id === Number(selectedProductId));

        if (!producto) {
            setError("Producto no encontrado.");
            return;
        }

        // Validar stock localmente (el backend lo validará también)
        if (numCantidad > producto.stock_actual) {
             setError(`Stock insuficiente para "${producto.nombre}". Stock actual: ${producto.stock_actual}`);
             return;
        }
        
        // Verificar si el producto ya está en el carrito
        const existing = detalles.find(d => d.productoId === producto.id);

        if (existing) {
            const nuevaCantidad = existing.cantidad + numCantidad;
             if (nuevaCantidad > producto.stock_actual) {
                setError(`Stock insuficiente para "${producto.nombre}". Stock actual: ${producto.stock_actual}`);
                return;
            }
            // Actualizar cantidad
            setDetalles(detalles.map(d => 
                d.productoId === producto.id
                    ? { ...d, cantidad: nuevaCantidad, subtotal: nuevaCantidad * d.precio_unitario }
                    : d
            ));
        } else {
            // Agregar nuevo item
            const newItem: DetalleVentaItem = {
                productoId: producto.id,
                nombre: producto.nombre,
                cantidad: numCantidad,
                precio_unitario: producto.precio_unitario,
                subtotal: numCantidad * producto.precio_unitario,
            };
            setDetalles([...detalles, newItem]);
        }

        // Resetear inputs
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

        // --- DTO: Exactamente como lo espera el backend ---
        // (CreateVentaDto solo espera 'detalles')
        // (CreateDetalleVentaDto solo espera 'id_producto' y 'cantidad')
        const detallesDto = detalles.map(d => ({
            id_producto: d.productoId,
            cantidad: d.cantidad,
        }));

        const createVentaDto = {
            detalles: detallesDto,
        };
        // ------------------------------------------------

        try {
            await api.post('/venta', createVentaDto);
            
            toast({
                title: "¡Éxito!",
                description: "Venta registrada correctamente.",
            });
            
            // Limpiar el formulario
            setDetalles([]);
            
            // Aquí deberías re-validar el stock de productos si el usuario
            // quiere hacer otra venta inmediatamente.
            
        } catch (err: any) {
            console.error("Error al registrar la venta:", err);
            // Captura el error específico del backend (ej. "Stock insuficiente")
            const errorMsg = err.response?.data?.message || "No se pudo registrar la venta.";
            setError(errorMsg);
            toast({
                title: "Error al registrar la venta",
                description: errorMsg,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmitVenta}>
            <div className="grid md:grid-cols-3 gap-8">
                {/* Columna 1: Agregar Productos */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader><CardTitle>Agregar Productos</CardTitle></CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="producto">Producto</Label>
                            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                <SelectTrigger id="producto">
                                    <SelectValue placeholder="Selecciona un producto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {productos.length === 0 && <SelectItem value="loading" disabled>Cargando productos...</SelectItem>}
                                    {productos.map(p => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.nombre} (${p.precio_unitario.toFixed(2)}) - Stock: {p.stock_actual}
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
                            Agregar a la Venta
                        </Button>
                    </CardContent>
                </Card>

                {/* Columna 2: Resumen de Venta */}
                <Card className="md:col-span-2">
                    <CardHeader><CardTitle>Resumen de Venta</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Cantidad</TableHead>
                                    <TableHead>P. Unitario</TableHead>
                                    <TableHead>Subtotal</TableHead>
                                    <TableHead>Acción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {detalles.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">Aún no hay productos en la venta.</TableCell>
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
                        {error && (
                            <Alert variant="destructive" className="w-full">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="flex justify-between items-center w-full">
                            <h3 className="text-xl font-bold">Total: ${total.toFixed(2)}</h3>
                            <Button type="submit" size="lg" disabled={isLoading}>
                                {isLoading ? "Registrando..." : "Registrar Venta"}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </form>
    );
}
