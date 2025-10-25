import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog } from '../components/ui/dialog';
import { ProductFormDialog } from '../components/ProductFormDialog';
import { ProductProvidersDialog } from '../components/ProductProvidersDialog';

// --- INTERFAZ UNIFICADA ---
// Esta es la definición oficial de Producto que usaremos en toda la app.
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

    useEffect(fetchProducts, []);

    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.marca.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    // Callback para cerrar diálogos y refrescar la lista
    const handleSuccess = () => {
        fetchProducts();
        setIsFormOpen(false);
        setIsProvidersOpen(false);
        setSelectedProduct(null);
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Product Management</h1>
                <Button onClick={() => { setSelectedProduct(null); setIsFormOpen(true); }}>
                    New Product
                </Button>
            </div>

            <Input
                placeholder="Search by name or brand..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="max-w-sm mb-4"
            />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Brand</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
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
                                        Edit
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={() => { setSelectedProduct(product); setIsProvidersOpen(true); }}>
                                        Providers
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

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