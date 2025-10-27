import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../services/api';

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Button } from '../components/ui/button';
import { Calendar } from '../components/ui/calendar';
import { Bar, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  PointElement, 
  LineElement 
} from 'chart.js';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../lib/utils';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  PointElement, 
  LineElement
);

// --- INTERFAZ PARA LA VENTA MÁS CARA (para claridad) ---
interface VentaDestacada {
  idVenta: number;
  fecha: string;
  total: number;
  vendedor: string;
}

export function DashboardPage() {
    const [startDate, setStartDate] = useState<Date | undefined>(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    );
    const [endDate, setEndDate] = useState<Date | undefined>(new Date());

    // --- ESTADOS ---
    const [resumen, setResumen] = useState({ ingresos: 0, costos: 0, ganancias: 0 });
    const [ventasMensuales, setVentasMensuales] = useState<any>({ labels: [], datasets: [] });
    const [topProducts, setTopProducts] = useState<any>({ labels: [], datasets: [] });
    // --- NUEVOS ESTADOS ---
    const [ventasVendedor, setVentasVendedor] = useState<any>({ labels: [], datasets: [] });
    const [ventaMasCara, setVentaMasCara] = useState<VentaDestacada | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isStartPopoverOpen, setIsStartPopoverOpen] = useState(false);
    const [isEndPopoverOpen, setIsEndPopoverOpen] = useState(false);

    const setQuickRange = (range: 'this_month' | 'last_month' | 'this_year') => {
        const now = new Date();
        let fromDate: Date | undefined;
        let toDate: Date | undefined = new Date(now.setHours(23, 59, 59, 999));

        if (range === 'this_month') {
            fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (range === 'last_month') {
            fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            toDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        } else if (range === 'this_year') {
            fromDate = new Date(now.getFullYear(), 0, 1);
        }

        setStartDate(fromDate);
        setEndDate(toDate);
    };

    useEffect(() => {
        if (startDate && endDate && startDate <= endDate) {
            setLoading(true);
            setError(null);
            const params = {
                startDate: startDate.toISOString(),
                endDate: new Date(endDate.setHours(23, 59, 59, 999)).toISOString(),
            };
            
            Promise.all([
                api.get('/dashboard/resumen-financiero', { params }),
                api.get('/dashboard/ventas-mensuales', { params }),
                api.get('/dashboard/productos-mas-vendidos', { params }),
                // --- NUEVAS LLAMADAS ---
                api.get('/dashboard/ventas-por-vendedor', { params }),
                api.get('/dashboard/venta-mas-cara', { params }),

            ]).then(([resumenRes, ventasRes, topProductsRes, ventasVendedorRes, ventaMasCaraRes]) => { // <-- Añadir nuevas respuestas
                
                // Resumen
                setResumen(resumenRes.data);
                
                // Ventas Mensuales
                setVentasMensuales({ 
                    labels: ventasRes.data.map((i: any) => i.mes), 
                    datasets: [{ 
                        label: 'Ventas Mensuales ($)', 
                        data: ventasRes.data.map((i: any) => i.totalVentas), 
                        borderColor: 'rgb(54, 162, 235)', 
                        backgroundColor: 'rgba(54, 162, 235, 0.5)' 
                    }] 
                });
                
                // Top Productos
                setTopProducts({ 
                    labels: topProductsRes.data.map((i: any) => i.nombreProducto), 
                    datasets: [{ 
                        label: 'Unidades Vendidas', 
                        data: topProductsRes.data.map((i: any) => i.totalVendido), 
                        backgroundColor: 'rgba(255, 99, 132, 0.5)' 
                    }] 
                });
                
                // --- PROCESAR NUEVOS DATOS ---

                // Ventas por Vendedor
                const ventasVendedorData = ventasVendedorRes.data;
                setVentasVendedor({
                    labels: ventasVendedorData.map((i: any) => i.vendedor),
                    datasets: [
                        {
                            label: 'Total Vendido ($)',
                            data: ventasVendedorData.map((i: any) => i.totalVendido),
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
                            borderColor: 'rgb(75, 192, 192)',
                            yAxisID: 'y', // Eje izquierdo para $
                        },
                        {
                            label: 'Cantidad de Ventas',
                            data: ventasVendedorData.map((i: any) => i.cantidadVentas),
                            backgroundColor: 'rgba(153, 102, 255, 0.5)',
                            borderColor: 'rgb(153, 102, 255)',
                            yAxisID: 'y1', // Eje derecho para cantidad
                        }
                    ]
                });

                // Venta más cara
                setVentaMasCara(ventaMasCaraRes.data);

            }).catch(err => {
                console.error("Error al cargar datos del dashboard:", err.response?.data || err);
                setError("No se pudieron cargar los reportes.");
            }).finally(() => setLoading(false));
        }
    }, [startDate, endDate]);

    const renderContent = () => {
        if (loading) return <p className="text-center py-10">Cargando reportes...</p>;
        if (error) return <p className="text-center py-10 text-destructive">{error}</p>;
        return (
            <>
                {/* --- FILA 1: RESUMEN FINANCIERO --- */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card><CardHeader><CardTitle>Ingresos Totales</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">${resumen.ingresos.toFixed(2)}</p></CardContent></Card>
                    <Card><CardHeader><CardTitle>Costos Totales (Promedio)</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">${resumen.costos.toFixed(2)}</p></CardContent></Card>
                    <Card><CardHeader><CardTitle>Ganancias Estimadas</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-emerald-600">${resumen.ganancias.toFixed(2)}</p></CardContent></Card>
                </div>

                {/* --- FILA 2: GRÁFICOS PRINCIPALES --- */}
                <div className="grid gap-8 md:grid-cols-2">
                    <Card><CardHeader><CardTitle>Ventas por Mes</CardTitle></CardHeader><CardContent>{ventasMensuales.labels.length > 0 ? <Line options={{ responsive: true }} data={ventasMensuales} /> : <p className="text-muted-foreground">No hay datos en este período.</p>}</CardContent></Card>
                    <Card><CardHeader><CardTitle>Top 10 Productos Vendidos</CardTitle></CardHeader><CardContent>{topProducts.labels.length > 0 ? <Bar options={{ responsive: true, indexAxis: 'y' as const, plugins: { legend: { display: false } } }} data={topProducts} /> : <p className="text-muted-foreground">No hay datos en este período.</p>}</CardContent></Card>
                </div>

                {/* --- FILA 3: NUEVAS ESTADÍSTICAS --- */}
                <div className="grid gap-8 md:grid-cols-2">
                    
                    {/* Tarjeta de Rendimiento por Vendedor */}
                    <Card>
                        <CardHeader><CardTitle>Rendimiento por Vendedor</CardTitle></CardHeader>
                        <CardContent>
                            {ventasVendedor.labels.length > 0 ? (
                                <Bar 
                                    options={{ 
                                        responsive: true,
                                        // Configuración para dos ejes Y (uno para $ y otro para cantidad)
                                        scales: {
                                            y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Total Vendido ($)' } },
                                            y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Cantidad Ventas' }, grid: { drawOnChartArea: false } }
                                        }
                                    }} 
                                    data={ventasVendedor} 
                                />
                            ) : (
                                <p className="text-muted-foreground">No hay datos en este período.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Tarjeta de Venta Destacada */}
                    <Card>
                        <CardHeader><CardTitle>Venta Destacada (Monto Más Alto)</CardTitle></CardHeader>
                        <CardContent>
                            {ventaMasCara ? (
                                <div className="space-y-3">
                                    <p className="text-3xl font-bold text-blue-600">${parseFloat(ventaMasCara.total.toString()).toFixed(2)}</p>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <p><strong>Vendedor:</strong> {ventaMasCara.vendedor}</p>
                                        <p><strong>Fecha:</strong> {format(new Date(ventaMasCara.fecha), 'PPpp', { locale: es })}</p>
                                        <p><strong>ID Venta:</strong> #{ventaMasCara.idVenta}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No se encontró una venta destacada en este período.</p>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reportes y Estadísticas</h1>
                    <p className="text-muted-foreground">Analiza el rendimiento de tu negocio con filtros de fecha.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                    {/* --- Controles de fecha (sin cambios) --- */}
                    <Button variant="ghost" size="sm" onClick={() => setQuickRange('this_month')}>Este Mes</Button>
                    <Button variant="ghost" size="sm" onClick={() => setQuickRange('last_month')}>Mes Pasado</Button>
                    <Button variant="ghost" size="sm" onClick={() => setQuickRange('this_year')}>Este Año</Button>
                    <Popover open={isStartPopoverOpen} onOpenChange={setIsStartPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-[150px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, "dd/MM/yy") : <span>Fecha Inicio</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar mode="single" selected={startDate} onSelect={(d) => { setStartDate(d); setIsStartPopoverOpen(false); }} disabled={(d) => d > (endDate || new Date())} initialFocus locale={es} />
                        </PopoverContent>
                    </Popover>
                    <span>-</span>
                    <Popover open={isEndPopoverOpen} onOpenChange={setIsEndPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-[150px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, "dd/MM/yy") : <span>Fecha Fin</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar mode="single" selected={endDate} onSelect={(d) => { setEndDate(d); setIsEndPopoverOpen(false); }} disabled={(d) => d < (startDate || new Date("1900-01-01"))} initialFocus locale={es} />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            {/* Contenido principal (resumen y gráficos) */}
            {renderContent()}
        </div>
    );
}