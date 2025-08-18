import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { format } from 'date-fns';
import type { DailyReportResponseDto } from '../../../../../../client';

// For now, using default fonts to ensure PDF generation works
// Arabic support can be added later with local font files

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4b3526',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#666666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4b3526',
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#4b3526',
    paddingBottom: 4,
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#4b3526',
    color: '#ffffff',
  },
  tableColHeader: {
    width: '25%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
  },
  tableCol: {
    width: '25%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
  },
  tableCellHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCell: {
    fontSize: 10,
    textAlign: 'left',
  },
  tableCellCenter: {
    fontSize: 10,
    textAlign: 'center',
  },
  tableCellRight: {
    fontSize: 10,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  noData: {
    fontSize: 10,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666666',
  },
  evenRow: {
    backgroundColor: '#f9f9f9',
  },
});

// PDF Document Component
const DailyReportDocument = ({ reportData, selectedDate }: { 
  reportData: DailyReportResponseDto; 
  selectedDate: Date; 
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>RADIANT EXPRESS</Text>
        <Text style={styles.subtitle}>Daily Business Report</Text>
        <Text style={styles.date}>{format(selectedDate, 'EEEE, MMMM dd, yyyy')}</Text>
        <Text style={styles.date}>Generated: {new Date(reportData.generatedAt).toLocaleString()}</Text>
      </View>

      {/* Cash Summary */}
      <Text style={styles.sectionTitle}>Financial Summary</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableColHeader, { width: '50%' }]}>
            <Text style={styles.tableCellHeader}>Category</Text>
          </View>
          <View style={[styles.tableColHeader, { width: '50%' }]}>
            <Text style={styles.tableCellHeader}>Amount</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={[styles.tableCol, { width: '50%' }]}>
            <Text style={styles.tableCell}>Services Revenue</Text>
          </View>
          <View style={[styles.tableCol, { width: '50%' }]}>
            <Text style={styles.tableCellRight}>${reportData.cashSummary.servicesCash.toFixed(2)}</Text>
          </View>
        </View>
        <View style={[styles.tableRow, styles.evenRow]}>
          <View style={[styles.tableCol, { width: '50%' }]}>
            <Text style={styles.tableCell}>Add-ons Revenue</Text>
          </View>
          <View style={[styles.tableCol, { width: '50%' }]}>
            <Text style={styles.tableCellRight}>${reportData.cashSummary.addOnsCash.toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={[styles.tableCol, { width: '50%' }]}>
            <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>TOTAL REVENUE</Text>
          </View>
          <View style={[styles.tableCol, { width: '50%' }]}>
            <Text style={[styles.tableCellRight, { fontSize: 12, color: '#4b3526' }]}>
              ${reportData.cashSummary.totalCash.toFixed(2)}
            </Text>
          </View>
        </View>
        <View style={[styles.tableRow, styles.evenRow]}>
          <View style={[styles.tableCol, { width: '50%' }]}>
            <Text style={styles.tableCell}>Transactions Completed</Text>
          </View>
          <View style={[styles.tableCol, { width: '50%' }]}>
            <Text style={styles.tableCellRight}>{reportData.cashSummary.transactionCount}</Text>
          </View>
        </View>
      </View>

      {/* Technician Shifts */}
      <Text style={styles.sectionTitle}>Technician Performance</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableColHeader, { width: '20%' }]}>
            <Text style={styles.tableCellHeader}>Technician</Text>
          </View>
          <View style={[styles.tableColHeader, { width: '12%' }]}>
            <Text style={styles.tableCellHeader}>Start</Text>
          </View>
          <View style={[styles.tableColHeader, { width: '12%' }]}>
            <Text style={styles.tableCellHeader}>End</Text>
          </View>
          <View style={[styles.tableColHeader, { width: '12%' }]}>
            <Text style={styles.tableCellHeader}>Break</Text>
          </View>
          <View style={[styles.tableColHeader, { width: '12%' }]}>
            <Text style={styles.tableCellHeader}>Overtime</Text>
          </View>
          <View style={[styles.tableColHeader, { width: '16%' }]}>
            <Text style={styles.tableCellHeader}>Working</Text>
          </View>
          <View style={[styles.tableColHeader, { width: '16%' }]}>
            <Text style={styles.tableCellHeader}>OT Comp.</Text>
          </View>
        </View>
        {reportData.technicianShifts.filter(shift => shift.worked).length > 0 ? (
          reportData.technicianShifts
            .filter(shift => shift.worked)
            .map((shift, index) => (
              <View key={shift.technicianId} style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : {}]}>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text style={styles.tableCell}>{shift.technicianName}</Text>
                </View>
                <View style={[styles.tableCol, { width: '12%' }]}>
                  <Text style={styles.tableCellCenter}>{shift.shiftStartTime || '00:00:00'}</Text>
                </View>
                <View style={[styles.tableCol, { width: '12%' }]}>
                  <Text style={styles.tableCellCenter}>{shift.shiftEndTime || '00:00:00'}</Text>
                </View>
                <View style={[styles.tableCol, { width: '12%' }]}>
                  <Text style={styles.tableCellCenter}>{shift.totalBreakTime || '00:00:00'}</Text>
                </View>
                <View style={[styles.tableCol, { width: '12%' }]}>
                  <Text style={styles.tableCellCenter}>{shift.totalOvertimeTime || '00:00:00'}</Text>
                </View>
                <View style={[styles.tableCol, { width: '16%' }]}>
                  <Text style={[styles.tableCellCenter, { fontWeight: 'bold' }]}>
                    {shift.totalWorkingTime || '00:00:00'}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: '16%' }]}>
                  <Text style={[styles.tableCellCenter, { color: '#16a34a', fontWeight: 'bold' }]}>
                    ${shift.overtimeCompensation.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))
        ) : (
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '100%' }]}>
              <Text style={styles.noData}>No technicians worked on this date</Text>
            </View>
          </View>
        )}
      </View>

      {/* Sales Attribution */}
      <Text style={styles.sectionTitle}>Sales Attribution</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableColHeader, { width: '25%' }]}>
            <Text style={styles.tableCellHeader}>Person</Text>
          </View>
          <View style={[styles.tableColHeader, { width: '12%' }]}>
            <Text style={styles.tableCellHeader}>Role</Text>
          </View>
          <View style={[styles.tableColHeader, { width: '18%' }]}>
            <Text style={styles.tableCellHeader}>Services</Text>
          </View>
          <View style={[styles.tableColHeader, { width: '18%' }]}>
            <Text style={styles.tableCellHeader}>Add-ons</Text>
          </View>
          <View style={[styles.tableColHeader, { width: '12%' }]}>
            <Text style={styles.tableCellHeader}>Commission</Text>
          </View>
          <View style={[styles.tableColHeader, { width: '15%' }]}>
            <Text style={styles.tableCellHeader}>Total</Text>
          </View>
        </View>
        {reportData.userSales.length > 0 ? (
          reportData.userSales.map((sale, index) => (
            <View key={sale.userId} style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : {}]}>
              <View style={[styles.tableCol, { width: '25%' }]}>
                <Text style={styles.tableCell}>{sale.userName}</Text>
              </View>
              <View style={[styles.tableCol, { width: '12%' }]}>
                <Text style={[styles.tableCell, { fontSize: 8 }]}>
                  {sale.userRole === 'SALES_PERSON' ? 'Sales' : sale.userRole}
                </Text>
              </View>
              <View style={[styles.tableCol, { width: '18%' }]}>
                <Text style={styles.tableCellCenter}>
                  {sale.services.count || 0} (${(sale.services.total || 0).toFixed(2)})
                </Text>
              </View>
              <View style={[styles.tableCol, { width: '18%' }]}>
                <Text style={styles.tableCellCenter}>
                  {sale.addOns.count || 0} (${(sale.addOns.total || 0).toFixed(2)})
                </Text>
              </View>
              <View style={[styles.tableCol, { width: '12%' }]}>
                <Text style={[styles.tableCellCenter, { color: '#ea580c', fontWeight: 'bold' }]}>
                  ${(sale.addOnCommission || 0).toFixed(2)}
                </Text>
              </View>
              <View style={[styles.tableCol, { width: '15%' }]}>
                <Text style={styles.tableCellRight}>
                  ${((sale.services.total || 0) + (sale.addOns.total || 0)).toFixed(2)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '100%' }]}>
              <Text style={styles.noData}>No sales data recorded for this date</Text>
            </View>
          </View>
        )}
        
        {/* Summary Row */}
        {reportData.userSales.length > 0 && (
          <View style={[styles.tableRow, { backgroundColor: '#f3f4f6' }]}>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>TOTAL</Text>
            </View>
            <View style={[styles.tableCol, { width: '12%' }]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, { width: '18%' }]}>
              <Text style={[styles.tableCellCenter, { fontWeight: 'bold', color: '#16a34a' }]}>
                {reportData.userSales.reduce((sum, sale) => sum + (sale.services.count || 0), 0)} 
                (${reportData.userSales.reduce((sum, sale) => sum + (sale.services.total || 0), 0).toFixed(2)})
              </Text>
            </View>
            <View style={[styles.tableCol, { width: '18%' }]}>
              <Text style={[styles.tableCellCenter, { fontWeight: 'bold', color: '#2563eb' }]}>
                {reportData.userSales.reduce((sum, sale) => sum + (sale.addOns.count || 0), 0)} 
                (${reportData.userSales.reduce((sum, sale) => sum + (sale.addOns.total || 0), 0).toFixed(2)})
              </Text>
            </View>
            <View style={[styles.tableCol, { width: '12%' }]}>
              <Text style={[styles.tableCellCenter, { fontWeight: 'bold', color: '#ea580c' }]}>
                ${reportData.userSales.reduce((sum, sale) => sum + (sale.addOnCommission || 0), 0).toFixed(2)}
              </Text>
            </View>
            <View style={[styles.tableCol, { width: '15%' }]}>
              <Text style={[styles.tableCellRight, { fontWeight: 'bold', color: '#9333ea' }]}>
                ${reportData.userSales.reduce((sum, sale) => 
                  sum + (sale.services.total || 0) + (sale.addOns.total || 0), 0).toFixed(2)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={{ marginTop: 30, textAlign: 'center', borderTop: 1, borderColor: '#ddd', paddingTop: 10 }}>
        <Text style={{ fontSize: 10, color: '#666' }}>
          This report provides comprehensive insights into daily business performance including financial metrics, 
          staff productivity, and sales effectiveness.
        </Text>
      </View>
    </Page>
  </Document>
);

// Main function to generate and download PDF
export async function generatePDF(reportData: DailyReportResponseDto, selectedDate: Date) {
  try {
    // Create the PDF document
    const doc = <DailyReportDocument reportData={reportData} selectedDate={selectedDate} />;
    
    // Generate PDF blob
    const blob = await pdf(doc).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `daily-report-${format(selectedDate, 'yyyy-MM-dd')}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
}