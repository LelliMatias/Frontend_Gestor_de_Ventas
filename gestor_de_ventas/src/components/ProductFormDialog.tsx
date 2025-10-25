import { useState, useEffect } from 'react';
import api from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from './ui/dialog';
import type { Product } from '../pages/ProductPage';

// --- Interfaces y Modales Internos (Componentes de ayuda) ---
interface Marca { id: number; nombre: string; }
interface Linea { id: number; nombre: string; marca: { id: number }; }

// Modal para crear Marca al vuelo
function MarcaModal({ onMarcaCreated }: { onMarcaCreated: (marca: Marca) => void }) {
    const [nombreMarca, setNombreMarca] = useState('');
    const handleCreate = async () => {
        if (!nombreMarca) return;
        try {
            const { data } = await api.post<Marca>('/marcas', { nombre: nombreMarca });
            onMarcaCreated(data);
        } catch (error) {
            console.error("Error al crear la marca:", error);
        }
    };
    return (
        <DialogContent>
            <DialogHeader><DialogTitle>Crear Nueva Marca</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
                <Label htmlFor="new-marca">Nombre de la Marca</Label>
                <Input id="new-marca" value={nombreMarca} onChange={(e) => setNombreMarca(e.target.value)} />
            </div>
            <DialogFooter><Button onClick={handleCreate}>Guardar Marca</Button></DialogFooter>
        </DialogContent>
    );
}

// Modal para crear Línea al vuelo
function LineaModal({ marcaId, onLineaCreated }: { marcaId: number, onLineaCreated: (linea: Linea) => void }) {
    const [nombreLinea, setNombreLinea] = useState('');
    const handleCreate = async () => {
        if (!nombreLinea || !marcaId) return;
        try {
            const { data } = await api.post<Linea>('/lineas', { nombre: nombreLinea, id_marca: marcaId });
            onLineaCreated(data);
        } catch (error) {
            console.error("Error al crear la línea:", error);
        }
    };
    return (
        <DialogContent>
            <DialogHeader><DialogTitle>Crear Nueva Línea</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
                <Label htmlFor="new-linea">Nombre de la Línea</Label>
                <Input id="new-linea" value={nombreLinea} onChange={(e) => setNombreLinea(e.target.value)} />
            </div>
            <DialogFooter><Button onClick={handleCreate}>Guardar Línea</Button></DialogFooter>
        </DialogContent>
    );
}

// --- Componente Principal del Diálogo ---
interface ProductFormDialogProps {
    productToEdit: Product | null;
    onSuccess: () => void;
}

export function ProductFormDialog({ productToEdit, onSuccess }: ProductFormDialogProps) {
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [lineas, setLineas] = useState<Linea[]>([]);
    // Se elimina el estado 'selectedMarca' para usar una única fuente de verdad.
    const [productData, setProductData] = useState({
        nombre: '',
        descripcion: '',
        precio_unitario: '',
        stock_actual: '',
        imagen: '',
        id_linea: null as number | null,
        id_marca: null as number | null,
    });
    const [loading, setLoading] = useState(false);
    const [isMarcaModalOpen, setIsMarcaModalOpen] = useState(false);
    const [isLineaModalOpen, setIsLineaModalOpen] = useState(false);

    // Carga inicial de marcas
    useEffect(() => {
        api.get<Marca[]>('/marcas').then(res => setMarcas(res.data));
    }, []);

    // Efecto para rellenar el formulario en modo edición o limpiarlo en modo creación
    useEffect(() => {
        if (productToEdit) {
            setLoading(true);
            api.get<Product>(`/productos/${productToEdit.id}`).then(res => {
                const p = res.data;
                setProductData({
                    nombre: p.nombre,
                    descripcion: p.descripcion || '',
                    precio_unitario: String(p.precioUnitario),
                    stock_actual: String(p.stockActual),
                    imagen: p.imagen || '',
                    id_linea: p.linea.id,
                    id_marca: p.marca.id,
                });
            }).finally(() => setLoading(false));
        } else {
            // Limpia el formulario para una nueva entrada
            setProductData({ nombre: '', descripcion: '', precio_unitario: '', stock_actual: '', imagen: '', id_linea: null, id_marca: null });
        }
    }, [productToEdit]);

    // Efecto para cargar las líneas correspondientes cuando cambia la marca en 'productData'
    useEffect(() => {
        if (productData.id_marca) {
            api.get<Linea[]>('/lineas').then(res => {
                setLineas(res.data.filter(linea => linea.marca.id === productData.id_marca));
            });
        } else {
            setLineas([]); // Si no hay marca seleccionada, vacía la lista de líneas
        }
    }, [productData.id_marca]);

    // Callback para cuando se crea una nueva marca
    const handleMarcaCreated = (nuevaMarca: Marca) => {
        setMarcas(prev => [...prev, nuevaMarca]);
        // Actualiza el ID de la marca en el formulario y resetea la línea
        setProductData(prev => ({ ...prev, id_marca: nuevaMarca.id, id_linea: null }));
        setIsMarcaModalOpen(false);
    };

    // Callback para cuando se crea una nueva línea
    const handleLineaCreated = (nuevaLinea: Linea) => {
        setLineas(prev => [...prev, nuevaLinea]);
        // Selecciona la nueva línea en el formulario
        setProductData(prev => ({ ...prev, id_linea: nuevaLinea.id }));
        setIsLineaModalOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProductData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones en el frontend antes de enviar
        if (!productData.id_marca) {
            alert("Debes seleccionar una marca.");
            return;
        }
        if (!productData.id_linea) {
            alert("Debes seleccionar una línea.");
            return;
        }
        const precio = parseFloat(productData.precio_unitario);
        const stock = parseInt(productData.stock_actual, 10);
        if (isNaN(precio) || isNaN(stock) || precio <= 0 || stock < 0) {
            alert("El precio y el stock deben ser números válidos y positivos.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                nombre: productData.nombre,
                descripcion: productData.descripcion,
                imagen: productData.imagen,
                precio_unitario: precio,
                stock_actual: stock,
                id_linea: productData.id_linea,
                id_marca: productData.id_marca,
            };

            if (productToEdit) {
                await api.patch(`/productos/${productToEdit.id}`, payload);
                alert('¡Producto actualizado con éxito!');
            } else {
                await api.post<Product>('/productos', payload);
                alert('¡Producto creado con éxito!');
            }
            onSuccess();
        } catch (error: any) {
            console.error("Error detallado al guardar el producto:", error.response?.data || error.message);
            const backendMessage = error.response?.data?.message;
            alert(`Error: ${backendMessage || 'No se pudo guardar el producto.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
                <DialogTitle>{productToEdit ? 'Editar Producto' : 'Crear Nuevo Producto'}</DialogTitle>
                <DialogDescription>
                    {productToEdit ? 'Modifica los datos del producto.' : 'Llena los campos para registrar un nuevo producto.'}
                </DialogDescription>
            </DialogHeader>
            {loading && productToEdit ? <p className="py-4">Cargando datos del producto...</p> : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* Columna 1 */}
                    <div className="grid gap-4">
                        <div className="grid gap-2"><Label htmlFor="nombre">Nombre del Producto</Label><Input id="nombre" name="nombre" value={productData.nombre} onChange={handleInputChange} required /></div>
                        <div className="grid gap-2"><Label htmlFor="descripcion">Descripción</Label><Input id="descripcion" name="descripcion" value={productData.descripcion} onChange={handleInputChange} /></div>
                        <div className="grid gap-2"><Label htmlFor="imagen">URL de la Imagen</Label><Input id="imagen" name="imagen" value={productData.imagen} onChange={handleInputChange} placeholder="https://ejemplo.com/imagen.jpg" /></div>
                    </div>
                    {/* Columna 2 */}
                    <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2"><Label htmlFor="precio_unitario">Precio</Label><Input id="precio_unitario" name="precio_unitario" type="number" step="0.01" value={productData.precio_unitario} onChange={handleInputChange} required /></div>
                            <div className="grid gap-2"><Label htmlFor="stock_actual">Stock</Label><Input id="stock_actual" name="stock_actual" type="number" value={productData.stock_actual} onChange={handleInputChange} required /></div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Marca</Label>
                            <div className="flex items-center gap-2">
                                <Select
                                    value={productData.id_marca ? String(productData.id_marca) : ''}
                                    onValueChange={(value) => setProductData(prev => ({ ...prev, id_marca: parseInt(value), id_linea: null }))}
                                >
                                    <SelectTrigger><SelectValue placeholder="Selecciona una marca" /></SelectTrigger>
                                    <SelectContent>{marcas.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.nombre}</SelectItem>)}</SelectContent>
                                </Select>
                                <Dialog open={isMarcaModalOpen} onOpenChange={setIsMarcaModalOpen}>
                                    <DialogTrigger asChild><Button type="button" variant="outline" size="icon">+</Button></DialogTrigger>
                                    <MarcaModal onMarcaCreated={handleMarcaCreated} />
                                </Dialog>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Línea</Label>
                            <div className="flex items-center gap-2">
                                <Select
                                    disabled={!productData.id_marca}
                                    value={productData.id_linea ? String(productData.id_linea) : ''}
                                    onValueChange={(value) => setProductData(prev => ({ ...prev, id_linea: parseInt(value) }))}
                                >
                                    <SelectTrigger><SelectValue placeholder="Selecciona una línea" /></SelectTrigger>
                                    <SelectContent>{lineas.map(l => <SelectItem key={l.id} value={String(l.id)}>{l.nombre}</SelectItem>)}</SelectContent>
                                </Select>
                                <Dialog open={isLineaModalOpen} onOpenChange={setIsLineaModalOpen}>
                                    <DialogTrigger asChild><Button type="button" variant="outline" size="icon" disabled={!productData.id_marca}>+</Button></DialogTrigger>
                                    {productData.id_marca && <LineaModal marcaId={productData.id_marca} onLineaCreated={handleLineaCreated} />}
                                </Dialog>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="md:col-span-2">
                        <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar Cambios'}</Button>
                    </DialogFooter>
                </form>
            )}
        </DialogContent>
    );
}