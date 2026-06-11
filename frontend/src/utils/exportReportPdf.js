import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getCategoryLabel } from '../constants/dishCategories';

function formatMoney(amount) {
    return `Bs ${Number(amount || 0).toLocaleString('es-BO')}`;
}

function formatDateTime(iso) {
    return new Date(iso).toLocaleString('es-BO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function exportReportPdf(snapshot) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margin = 14;
    let y = margin;

    const addTitle = (text, size = 14) => {
        if (y > 270) {
            doc.addPage();
            y = margin;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(size);
        doc.text(text, margin, y);
        y += size * 0.5 + 4;
    };

    const addParagraph = (text, size = 10) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(size);
        const lines = doc.splitTextToSize(text, 180);
        if (y + lines.length * 5 > 280) {
            doc.addPage();
            y = margin;
        }
        doc.text(lines, margin, y);
        y += lines.length * 5 + 3;
    };

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Pension Familiar — Reporte de Operaciones', margin, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Período: últimos ${snapshot.periodDays} días`, margin, y);
    y += 5;
    doc.text(`Generado: ${formatDateTime(snapshot.generatedAt)}`, margin, y);
    y += 10;

    // Executive summary
    addTitle('Resumen ejecutivo', 12);
    const s = snapshot.summary;
    addParagraph(
        `Ingresos: ${formatMoney(s.revenue)} | Pedidos: ${s.orderCount} | Ticket promedio: ${formatMoney(s.avgTicket)} | Cobrado: ${s.paidPercent}% (${formatMoney(s.paidRevenue)}) | Pendiente: ${formatMoney(s.unpaidRevenue)} | Para llevar: ${s.takeawayPercent}%`
    );
    addParagraph(
        `Hoy: ${formatMoney(snapshot.todaySummary.revenue)} en ${snapshot.todaySummary.orderCount} pedidos. Calificación (demo): ${snapshot.satisfactionScore}/5`
    );

    // Daily breakdown
    addTitle('Ingresos por día', 12);
    autoTable(doc, {
        startY: y,
        head: [['Fecha', 'Pedidos', 'Ingresos (Bs)', 'Ticket prom.']],
        body: snapshot.dailyBreakdown.map(d => [
            d.label,
            String(d.orders),
            d.revenue.toLocaleString('es-BO'),
            d.avgTicket.toLocaleString('es-BO'),
        ]),
        margin: { left: margin, right: margin },
        styles: { fontSize: 9 },
        headStyles: { fillColor: [133, 52, 31] },
    });
    y = doc.lastAutoTable.finalY + 8;

    // Top dishes
    addTitle('Ranking de platillos', 12);
    autoTable(doc, {
        startY: y,
        head: [['Platillo', 'Categoría', 'Unidades', 'Ingresos (Bs)']],
        body: snapshot.topDishes.map(d => [
            d.name,
            getCategoryLabel(d.type),
            String(d.units),
            d.revenue.toLocaleString('es-BO'),
        ]),
        margin: { left: margin, right: margin },
        styles: { fontSize: 9 },
        headStyles: { fillColor: [133, 52, 31] },
    });
    y = doc.lastAutoTable.finalY + 8;

    // Top combos
    if (snapshot.topCombos.length > 0) {
        addTitle('Ranking de combos', 12);
        autoTable(doc, {
            startY: y,
            head: [['Combo', 'Ventas', 'Ingresos (Bs)']],
            body: snapshot.topCombos.map(c => [
                c.name,
                String(c.units),
                c.revenue.toLocaleString('es-BO'),
            ]),
            margin: { left: margin, right: margin },
            styles: { fontSize: 9 },
            headStyles: { fillColor: [133, 52, 31] },
        });
        y = doc.lastAutoTable.finalY + 8;
    }

    // Sales by category
    addTitle('Ventas por categoría', 12);
    autoTable(doc, {
        startY: y,
        head: [['Categoría', 'Unidades', 'Ingresos (Bs)']],
        body: snapshot.salesByCategory.map(c => [
            c.type === 'Combo' ? 'Combo' : getCategoryLabel(c.type),
            String(c.units),
            c.revenue.toLocaleString('es-BO'),
        ]),
        margin: { left: margin, right: margin },
        styles: { fontSize: 9 },
        headStyles: { fillColor: [133, 52, 31] },
    });
    y = doc.lastAutoTable.finalY + 8;

    // Top clients
    if (snapshot.topClients.length > 0) {
        addTitle('Mejores clientes', 12);
        autoTable(doc, {
            startY: y,
            head: [['Cliente', 'Teléfono', 'Pedidos', 'Ingresos (Bs)']],
            body: snapshot.topClients.map(c => [
                c.name,
                c.phone,
                String(c.orders),
                c.revenue.toLocaleString('es-BO'),
            ]),
            margin: { left: margin, right: margin },
            styles: { fontSize: 9 },
            headStyles: { fillColor: [133, 52, 31] },
        });
        y = doc.lastAutoTable.finalY + 8;
    }

    // Orders by status
    addTitle('Pedidos por estado', 12);
    autoTable(doc, {
        startY: y,
        head: [['Estado', 'Cantidad', '%']],
        body: snapshot.ordersByStatus.map(r => [
            r.status,
            String(r.count),
            `${r.percent}%`,
        ]),
        margin: { left: margin, right: margin },
        styles: { fontSize: 9 },
        headStyles: { fillColor: [133, 52, 31] },
    });
    y = doc.lastAutoTable.finalY + 8;

    // Peak hours
    addTitle('Horas pico', 12);
    autoTable(doc, {
        startY: y,
        head: [['Hora', 'Mesa', 'Para llevar', 'Total']],
        body: snapshot.peakHours
            .filter(h => h.total > 0)
            .map(h => [h.label, String(h.dining), String(h.delivery), String(h.total)]),
        margin: { left: margin, right: margin },
        styles: { fontSize: 9 },
        headStyles: { fillColor: [133, 52, 31] },
    });
    y = doc.lastAutoTable.finalY + 8;

    // Menu alerts
    addTitle('Alertas de menú (hoy)', 12);
    const alertLines = [];
    snapshot.menuAlerts.soldOut.forEach(e => alertLines.push(`AGOTADO: ${e.name}`));
    snapshot.menuAlerts.lowStock.forEach(e => alertLines.push(`Stock bajo (${e.stock}): ${e.name}`));
    if (alertLines.length === 0) {
        addParagraph('Sin alertas de stock para el menú de hoy.');
    } else {
        alertLines.forEach(line => addParagraph(`• ${line}`));
    }

    if (y > 250) {
        doc.addPage();
        y = margin;
    }
    addParagraph('Nota: datos generados desde la sesión actual del sistema (demostración frontend).');

    const dateStr = new Date().toISOString().slice(0, 10);
    doc.save(`reporte-pension-familiar-${dateStr}.pdf`);
}
