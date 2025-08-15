import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { format } from 'date-fns';

interface DetailedSaleRecord {
  id: string;
  transactionId: string;
  saleType: 'SERVICE' | 'ADDON';
  itemName: string;
  price: number;
  quantity: number;
  totalAmount: number;
  soldAt: string;
  sellerType: 'USER' | 'SALES_PERSON';
  sellerName: string;
  sellerRole: string;
  transactionStatus: string;
}

interface SummaryData {
  totalRevenue: number;
  totalItems: number;
  serviceRevenue: number;
  serviceCount: number;
  addonRevenue: number;
  addonCount: number;
  supervisorRevenue: number;
  salesPersonRevenue: number;
}

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 8,
  },
  header: {
    marginBottom: 15,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4b3526',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 3,
  },
  date: {
    fontSize: 10,
    color: '#666666',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4b3526',
    marginTop: 15,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#4b3526',
    paddingBottom: 3,
  },
  summaryGrid: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 2,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  summaryLabel: {
    fontSize: 8,
    color: '#666',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4b3526',
  },
  table: {
    width: '100%',
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#4b3526',
    color: '#ffffff',
  },
  tableCol: {
    borderWidth: 0.5,
    borderColor: '#ddd',
    padding: 3,
  },
  tableCellHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffff',
  },
  tableCell: {
    fontSize: 7,
    textAlign: 'left',
  },
  tableCellCenter: {
    fontSize: 7,
    textAlign: 'center',
  },
  tableCellRight: {
    fontSize: 7,
    textAlign: 'right',
  },
  evenRow: {
    backgroundColor: '#f9f9f9',
  },
  badge: {
    fontSize: 6,
    padding: 2,
    borderRadius: 2,
    textAlign: 'center',
  },
  serviceBadge: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
  },
  addonBadge: {
    backgroundColor: '#10b981',
    color: '#ffffff',
  },
  userBadge: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
  },
  salesPersonBadge: {
    backgroundColor: '#059669',
    color: '#ffffff',
  },
});

// PDF Document Component
const SalesReportDocument = ({ 
  salesData, 
  summary, 
  startDate, 
  endDate, 
  includeIncomplete 
}: { 
  salesData: DetailedSaleRecord[];
  summary: SummaryData;
  startDate: Date;
  endDate: Date;
  includeIncomplete: boolean;
}) => (
  <Document>
    <Page size="A4" style={styles.page} orientation="landscape">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>RADIANT EXPRESS</Text>
        <Text style={styles.subtitle}>Detailed Sales Report</Text>
        <Text style={styles.date}>
          {format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')}
        </Text>
        <Text style={styles.date}>
          Generated: {new Date().toLocaleString()} | 
          {includeIncomplete ? ' Including incomplete transactions' : ' Completed transactions only'} | 
          Total Records: {salesData.length}
        </Text>
      </View>

      {/* Summary Cards */}
      <Text style={styles.sectionTitle}>Summary</Text>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Revenue</Text>
          <Text style={styles.summaryValue}>${summary.totalRevenue.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Services</Text>
          <Text style={styles.summaryValue}>{summary.serviceCount} sold</Text>
          <Text style={styles.summaryLabel}>${summary.serviceRevenue.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Add-ons</Text>
          <Text style={styles.summaryValue}>{summary.addonCount} sold</Text>
          <Text style={styles.summaryLabel}>${summary.addonRevenue.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Items</Text>
          <Text style={styles.summaryValue}>{summary.totalItems}</Text>
        </View>
      </View>

      {/* Sales Data Table */}
      <Text style={styles.sectionTitle}>Sales Records</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCol, { width: '12%' }]}>
            <Text style={styles.tableCellHeader}>Date</Text>
          </View>
          <View style={[styles.tableCol, { width: '18%' }]}>
            <Text style={styles.tableCellHeader}>Seller</Text>
          </View>
          <View style={[styles.tableCol, { width: '10%' }]}>
            <Text style={styles.tableCellHeader}>Type</Text>
          </View>
          <View style={[styles.tableCol, { width: '25%' }]}>
            <Text style={styles.tableCellHeader}>Item</Text>
          </View>
          <View style={[styles.tableCol, { width: '8%' }]}>
            <Text style={styles.tableCellHeader}>Qty</Text>
          </View>
          <View style={[styles.tableCol, { width: '10%' }]}>
            <Text style={styles.tableCellHeader}>Price</Text>
          </View>
          <View style={[styles.tableCol, { width: '10%' }]}>
            <Text style={styles.tableCellHeader}>Total</Text>
          </View>
          <View style={[styles.tableCol, { width: '7%' }]}>
            <Text style={styles.tableCellHeader}>Status</Text>
          </View>
        </View>
        
        {salesData.slice(0, 50).map((record, index) => (
          <View key={record.id} style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : {}]}>
            <View style={[styles.tableCol, { width: '12%' }]}>
              <Text style={styles.tableCell}>
                {format(new Date(record.soldAt), "MMM dd, HH:mm")}
              </Text>
            </View>
            <View style={[styles.tableCol, { width: '18%' }]}>
              <Text style={styles.tableCell}>{record.sellerName}</Text>
              <Text style={[styles.badge, record.sellerType === 'SALES_PERSON' ? styles.salesPersonBadge : styles.userBadge]}>
                {record.sellerType === 'SALES_PERSON' ? 'Sales' : record.sellerRole}
              </Text>
            </View>
            <View style={[styles.tableCol, { width: '10%' }]}>
              <Text style={[styles.badge, record.saleType === 'SERVICE' ? styles.serviceBadge : styles.addonBadge]}>
                {record.saleType}
              </Text>
            </View>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCell}>{record.itemName}</Text>
            </View>
            <View style={[styles.tableCol, { width: '8%' }]}>
              <Text style={styles.tableCellCenter}>{record.quantity}</Text>
            </View>
            <View style={[styles.tableCol, { width: '10%' }]}>
              <Text style={styles.tableCellRight}>${record.price.toFixed(2)}</Text>
            </View>
            <View style={[styles.tableCol, { width: '10%' }]}>
              <Text style={styles.tableCellRight}>${record.totalAmount.toFixed(2)}</Text>
            </View>
            <View style={[styles.tableCol, { width: '7%' }]}>
              <Text style={[styles.tableCell, { fontSize: 6 }]}>
                {record.transactionStatus}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {salesData.length > 50 && (
        <Text style={[styles.date, { textAlign: 'center', marginTop: 10 }]}>
          Note: Only first 50 records shown. Total records: {salesData.length}
        </Text>
      )}

      {/* Footer */}
      <View style={{ marginTop: 20, textAlign: 'center', borderTop: 1, borderColor: '#ddd', paddingTop: 8 }}>
        <Text style={{ fontSize: 8, color: '#666' }}>
          This report provides detailed sales attribution showing individual transactions, 
          seller performance, and comprehensive revenue breakdown.
        </Text>
      </View>
    </Page>
  </Document>
);

// Main function to generate and download PDF
export async function generateSalesReportPDF(
  salesData: DetailedSaleRecord[], 
  summary: SummaryData,
  startDate: Date,
  endDate: Date,
  includeIncomplete: boolean
) {
  try {
    // Create the PDF document
    const doc = (
      <SalesReportDocument 
        salesData={salesData} 
        summary={summary}
        startDate={startDate}
        endDate={endDate}
        includeIncomplete={includeIncomplete}
      />
    );
    
    // Generate PDF blob
    const blob = await pdf(doc).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-report-${format(startDate, 'yyyy-MM-dd')}-to-${format(endDate, 'yyyy-MM-dd')}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error generating sales report PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
}