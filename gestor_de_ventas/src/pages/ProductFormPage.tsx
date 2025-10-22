import { useState, useEffect } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

// --- Interfaces para tipado ---
interface Marca {
    id: number;
    nombre: string;
}

interface Linea {
    id: number;
    nombre: string;
    marca: Marca; // La API de líneas devuelve el objeto de marca anidado
}

interface ProductFormData {
    nombre: string;
    descripcion?: string; // Campo opcional
    imagen?: string;      // Campo opcional
    precio_unitario: number | string;
    stock_actual: number | string;
    id_linea: number | null;
    id_marca: number | null;
}

// --- Props para los modales ---
interface MarcaModalProps {
    onMarcaCreated: (nuevaMarca: Marca) => void;
}

interface LineaModalProps {
    marcaId: number;
    onLineaCreated: (nuevaLinea: Linea) => void;
}

// --- Componente Modal para Marcas ---
function MarcaModal({ onMarcaCreated }: MarcaModalProps) {
    const [nombreMarca, setNombreMarca] = useState('');

    const handleCreateMarca = async () => {
        if (!nombreMarca) return;
        try {
            const { data } = await api.post<Marca>('/marcas', { nombre: nombreMarca });
            onMarcaCreated(data);
            setNombreMarca('');
        } catch (error) {
            console.error("Error creando la marca", error);
        }
    };

    return (
        <DialogContent>
            <DialogHeader><DialogTitle>Crear Nueva Marca</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
                <Label htmlFor="new-marca">Nombre de la Marca</Label>
                <Input id="new-marca" value={nombreMarca} onChange={(e) => setNombreMarca(e.target.value)} />
            </div>
            <Button onClick={handleCreateMarca}>Guardar Marca</Button>
        </DialogContent>
    );
}

// --- Componente Modal para Líneas ---
function LineaModal({ marcaId, onLineaCreated }: LineaModalProps) {
    const [nombreLinea, setNombreLinea] = useState('');

    const handleCreateLinea = async () => {
        if (!nombreLinea || !marcaId) return;
        try {
            const { data } = await api.post<Linea>('/lineas', {
                nombre: nombreLinea,
                id_marca: marcaId
            });
            onLineaCreated(data);
            setNombreLinea('');
        } catch (error) {
            console.error("Error creando la línea", error);
        }
    };

    return (
        <DialogContent>
            <DialogHeader><DialogTitle>Crear Nueva Línea</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
                <Label htmlFor="new-linea">Nombre de la Línea</Label>
                <Input id="new-linea" value={nombreLinea} onChange={(e) => setNombreLinea(e.target.value)} />
            </div>
            <Button onClick={handleCreateLinea}>Guardar Línea</Button>
        </DialogContent>
    );
}

// --- Componente Principal: Formulario de Producto ---
export function ProductFormPage() {
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [lineas, setLineas] = useState<Linea[]>([]);
    const [selectedMarca, setSelectedMarca] = useState<string | null>(null);
    const [isMarcaModalOpen, setIsMarcaModalOpen] = useState(false);
    const [isLineaModalOpen, setIsLineaModalOpen] = useState(false);

    const [productData, setProductData] = useState<ProductFormData>({
        nombre: '',
        descripcion: '',
        precio_unitario: '',
        stock_actual: '',
        imagen: '',
        id_linea: null,
        id_marca: null,
    });

    useEffect(() => {
        api.get<Marca[]>('/marcas').then(res => setMarcas(res.data));
    }, []);

    useEffect(() => {
        if (selectedMarca) {
            const marcaId = parseInt(selectedMarca, 10);
            setProductData(prev => ({ ...prev, id_marca: marcaId, id_linea: null }));

            api.get<Linea[]>('/lineas').then(res => {
                setLineas(res.data.filter(linea => linea.marca.id === marcaId));
            });
        }
    }, [selectedMarca]);

    const handleMarcaCreated = (nuevaMarca: Marca) => {
        setMarcas(prevMarcas => [...prevMarcas, nuevaMarca]);
        setSelectedMarca(String(nuevaMarca.id));
        setIsMarcaModalOpen(false); // Cierra el modal
    };

    const handleLineaCreated = (nuevaLinea: Linea) => {
        setLineas(prevLineas => [...prevLineas, nuevaLinea]);
        setProductData(prev => ({ ...prev, id_linea: nuevaLinea.id }));
        setIsLineaModalOpen(false); // Cierra el modal
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProductData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/productos', {
                ...productData,
                precio_unitario: parseFloat(productData.precio_unitario as string),
                stock_actual: parseInt(productData.stock_actual as string, 10),
            });
            alert('¡Producto creado con éxito!');
            // Aquí puedes limpiar el formulario o redirigir al usuario
        } catch (error) {
            console.error("Error al crear el producto:", error);
            alert('Hubo un error al crear el producto.');
        }
    };

    return (
        <Card>
            <CardHeader><CardTitle>Registrar Nuevo Producto</CardTitle></CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Columna 1 */}
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nombre">Nombre del Producto</Label>
                            <Input id="nombre" name="nombre" value={productData.nombre} onChange={handleInputChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="descripcion">Descripción</Label>
                            <Input id="descripcion" name="descripcion" value={productData.descripcion} onChange={handleInputChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="imagen">URL de la Imagen</Label>
                            <Input id="imagen" name="imagen" value={productData.imagen} onChange={handleInputChange} placeholder="https://ejemplo.com/imagen.jpg" />
                        </div>
                    </div>

                    {/* Columna 2 */}
                    <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="precio_unitario">Precio Unitario</Label>
                                <Input id="precio_unitario" name="precio_unitario" type="number" step="0.01" value={productData.precio_unitario} onChange={handleInputChange} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="stock_actual">Stock Actual</Label>
                                <Input id="stock_actual" name="stock_actual" type="number" value={productData.stock_actual} onChange={handleInputChange} required />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Marca</Label>
                            <div className="flex items-center gap-2">
                                <Select value={selectedMarca ?? ''} onValueChange={setSelectedMarca}>
                                    <SelectTrigger><SelectValue placeholder="Selecciona una marca" /></SelectTrigger>
                                    <SelectContent>
                                        {marcas.map(marca => (
                                            <SelectItem key={marca.id} value={String(marca.id)}>{marca.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Dialog open={isMarcaModalOpen} onOpenChange={setIsMarcaModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button type="button" variant="outline" size="icon">+</Button>
                                    </DialogTrigger>
                                    <MarcaModal onMarcaCreated={handleMarcaCreated} />
                                </Dialog>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Línea</Label>
                            <div className="flex items-center gap-2">
                                <Select
                                    disabled={!selectedMarca}
                                    value={productData.id_linea ? String(productData.id_linea) : ''}
                                    onValueChange={(value) => setProductData(prev => ({ ...prev, id_linea: parseInt(value, 10) }))}
                                >
                                    <SelectTrigger><SelectValue placeholder="Selecciona una línea" /></SelectTrigger>
                                    <SelectContent>
                                        {lineas.map(linea => (
                                            <SelectItem key={linea.id} value={String(linea.id)}>{linea.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Dialog open={isLineaModalOpen} onOpenChange={setIsLineaModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button type="button" variant="outline" size="icon" disabled={!selectedMarca}>+</Button>
                                    </DialogTrigger>
                                    {selectedMarca && (
                                        <LineaModal marcaId={parseInt(selectedMarca, 10)} onLineaCreated={handleLineaCreated} />
                                    )}
                                </Dialog>
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="md:col-span-2">Guardar Producto</Button>
                </form>
            </CardContent>
        </Card>
    );
}