import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog } from '../components/ui/dialog';
import { ProductFormDialog } from '../components/ProductFormDialog';
import { ProductProvidersDialog } from '../components/ProductProvidersDialog';
import { Card, CardContent, CardHeader } from '../components/ui/card'; // Importar CardDescription
import { PlusCircle } from 'lucide-react'; // Importar el ícono

// --- INTERFAZ UNIFICADA ---
export interface Product {
    id: number;
    nombre: string;
    descripcion?: string;
    precioUnitario: number;
    stockActual: number;
    imagen?: string;
    marca: { id: number; nombre: string; };
    linea: { id: number; nombre: string; };
}

export function ProductPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isProvidersOpen, setIsProvidersOpen] = useState(false);

    const fetchProducts = () => {
        api.get<Product[]>('/productos').then(res => setProducts(res.data));
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.marca.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const handleSuccess = () => {
        fetchProducts();
        setIsFormOpen(false);
        setIsProvidersOpen(false);
        setSelectedProduct(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Productos</h1>
                    <p className="text-muted-foreground">Busca, crea y gestiona todos los productos de tu inventario.</p>
                </div>
                <Button onClick={() => { setSelectedProduct(null); setIsFormOpen(true); }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuevo Producto
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <Input
                        placeholder="Buscar por nombre o marca..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Marca</TableHead>
                                <TableHead>Precio</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.map(product => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.nombre}</TableCell>
                                    <TableCell>{product.marca.nombre}</TableCell>
                                    <TableCell>${product.precioUnitario}</TableCell>
                                    <TableCell>{product.stockActual}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => { setSelectedProduct(product); setIsFormOpen(true); }}>
                                            Editar
                                        </Button>
                                        <Button variant="secondary" size="sm" onClick={() => { setSelectedProduct(product); setIsProvidersOpen(true); }}>
                                            Proveedores
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Diálogo para Crear/Editar Producto */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                {isFormOpen && <ProductFormDialog productToEdit={selectedProduct} onSuccess={handleSuccess} />}
            </Dialog>

            {/* Diálogo para Asignar Proveedores */}
            <Dialog open={isProvidersOpen} onOpenChange={setIsProvidersOpen}>
                {isProvidersOpen && selectedProduct && <ProductProvidersDialog product={selectedProduct} onSuccess={handleSuccess} />}
            </Dialog>
        </div>
    );
}