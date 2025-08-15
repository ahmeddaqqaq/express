import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { DailyReportResponseDto } from '../../../../../../client';


// Function to detect if text contains Arabic characters
const containsArabic = (text: string): boolean => {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
};

// Function to format text for PDF display
const formatTextForPDF = (text: string): string => {
  if (!text) return '';
  // For Arabic text, ensure proper encoding
  return text.trim();
};

export async function generatePDFWithJsPDF(reportData: DailyReportResponseDto, selectedDate: Date) {
  try {
    // Create new PDF document
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Set up document properties
    doc.setProperties({
      title: `Daily Report - ${format(selectedDate, 'yyyy-MM-dd')}`,
      subject: 'Daily Business Report',
      author: 'Radiant Express',
      creator: 'Radiant Express System'
    });

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RADIANT EXPRESS', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Daily Business Report', 105, 30, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(format(selectedDate, 'EEEE, MMMM dd, yyyy'), 105, 40, { align: 'center' });
    doc.text(`Generated: ${new Date(reportData.generatedAt).toLocaleString()}`, 105, 48, { align: 'center' });

    let yPos = 60;

    // Financial Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Financial Summary', 20, yPos);
    yPos += 10;

    const financialData = [
      ['Category', 'Amount'],
      ['Services Revenue', `$${reportData.cashSummary.servicesCash.toFixed(2)}`],
      ['Add-ons Revenue', `$${reportData.cashSummary.addOnsCash.toFixed(2)}`],
      ['TOTAL REVENUE', `$${reportData.cashSummary.totalCash.toFixed(2)}`],
      ['Transactions Completed', reportData.cashSummary.transactionCount.toString()]
    ];

    autoTable(doc, {
      startY: yPos,
      head: [financialData[0]],
      body: financialData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [75, 53, 38], textColor: 255, fontStyle: 'bold' },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 60, halign: 'right' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Technician Performance
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Technician Performance', 20, yPos);
    yPos += 10;

    const technicianHeaders = ['Technician', 'Start', 'End', 'Break', 'Overtime', 'Working', 'OT Comp.'];
    const technicianData = reportData.technicianShifts
      .filter(shift => shift.worked)
      .map(shift => [
        formatTextForPDF(shift.technicianName),
        shift.shiftStartTime || '00:00:00',
        shift.shiftEndTime || '00:00:00',
        shift.totalBreakTime || '00:00:00',
        shift.totalOvertimeTime || '00:00:00',
        shift.totalWorkingTime || '00:00:00',
        `$${shift.overtimeCompensation.toFixed(2)}`
      ]);

    if (technicianData.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [technicianHeaders],
        body: technicianData,
        theme: 'grid',
        headStyles: { fillColor: [75, 53, 38], textColor: 255, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 25 }, // Technician name
          1: { cellWidth: 18, halign: 'center' }, // Start
          2: { cellWidth: 18, halign: 'center' }, // End
          3: { cellWidth: 18, halign: 'center' }, // Break
          4: { cellWidth: 18, halign: 'center' }, // Overtime
          5: { cellWidth: 20, halign: 'center' }, // Working
          6: { cellWidth: 20, halign: 'right' }   // OT Comp
        },
        // Custom cell formatting for Arabic text
        didParseCell: function(data: any) {
          if (data.column.index === 0 && containsArabic(data.cell.raw)) {
            // For Arabic technician names, you can add specific formatting here
            data.cell.styles.textColor = [0, 0, 0];
          }
        }
      });
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('No technicians worked on this date', 20, yPos);
    }

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Sales Attribution
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Sales Attribution', 20, yPos);
    yPos += 10;

    const salesHeaders = ['Person', 'Role', 'Services', 'Add-ons', 'Commission', 'Total'];
    const salesData = reportData.userSales.map(sale => [
      formatTextForPDF(sale.userName),
      sale.userRole === 'SALES_PERSON' ? 'Sales' : sale.userRole,
      `${sale.services.count || 0} ($${(sale.services.total || 0).toFixed(2)})`,
      `${sale.addOns.count || 0} ($${(sale.addOns.total || 0).toFixed(2)})`,
      `$${(sale.addOnCommission || 0).toFixed(2)}`,
      `$${((sale.services.total || 0) + (sale.addOns.total || 0)).toFixed(2)}`
    ]);

    if (salesData.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [salesHeaders],
        body: salesData,
        theme: 'grid',
        headStyles: { fillColor: [75, 53, 38], textColor: 255, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 30 }, // Person
          1: { cellWidth: 20 }, // Role
          2: { cellWidth: 30, halign: 'center' }, // Services
          3: { cellWidth: 30, halign: 'center' }, // Add-ons
          4: { cellWidth: 25, halign: 'right' },  // Commission
          5: { cellWidth: 25, halign: 'right' }   // Total
        },
        // Custom cell formatting for Arabic text
        didParseCell: function(data: any) {
          if (data.column.index === 0 && containsArabic(data.cell.raw)) {
            // For Arabic user names, you can add specific formatting here
            data.cell.styles.textColor = [0, 0, 0];
          }
        }
      });

      // Add summary row
      const totalServices = reportData.userSales.reduce((sum, sale) => sum + (sale.services.count || 0), 0);
      const totalServicesRevenue = reportData.userSales.reduce((sum, sale) => sum + (sale.services.total || 0), 0);
      const totalAddOns = reportData.userSales.reduce((sum, sale) => sum + (sale.addOns.count || 0), 0);
      const totalAddOnsRevenue = reportData.userSales.reduce((sum, sale) => sum + (sale.addOns.total || 0), 0);
      const totalCommission = reportData.userSales.reduce((sum, sale) => sum + (sale.addOnCommission || 0), 0);
      const grandTotal = totalServicesRevenue + totalAddOnsRevenue;

      const summaryData = [[
        'TOTAL',
        '',
        `${totalServices} ($${totalServicesRevenue.toFixed(2)})`,
        `${totalAddOns} ($${totalAddOnsRevenue.toFixed(2)})`,
        `$${totalCommission.toFixed(2)}`,
        `$${grandTotal.toFixed(2)}`
      ]];

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 2,
        body: summaryData,
        theme: 'grid',
        bodyStyles: { fontSize: 9, fontStyle: 'bold', fillColor: [243, 244, 246] },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 20 },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 30, halign: 'center' },
          4: { cellWidth: 25, halign: 'right' },
          5: { cellWidth: 25, halign: 'right' }
        }
      });
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('No sales data recorded for this date', 20, yPos);
    }

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'This report provides comprehensive insights into daily business performance including financial metrics, staff productivity, and sales effectiveness.',
      105,
      pageHeight - 20,
      { align: 'center', maxWidth: 160 }
    );

    // Save the PDF
    const fileName = `daily-report-${format(selectedDate, 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);

    console.log('PDF generated successfully with jsPDF');
    
  } catch (error) {
    console.error('Error generating PDF with jsPDF:', error);
    throw new Error('Failed to generate PDF report');
  }
}