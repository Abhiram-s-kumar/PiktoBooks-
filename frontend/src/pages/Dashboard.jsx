import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Dropdown } from 'react-bootstrap';
import { FaPlus, FaFileExport, FaFilePdf, FaFileCsv } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import API_BASE_URL from '../config/api.js';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStock: 0,
    totalSales: 0,
    totalPurchaseValue: 0,
    totalSellingValue: 0,
    profit: 0
  });
  const [dayBook, setDayBook] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [totals, setTotals] = useState({
    openingBalance: 0,
    cash: 0,
    upi: 0,
    card: 0,
    totalAmount: 0,
    totalTransactions: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch both stats and daybook in parallel
        const [statsResponse, daybookResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/reports/dashboard`, { headers }),
          axios.get(`${API_BASE_URL}/api/reports/daybook?date=${selectedDate}`, { headers })
        ]);
        
        setStats(statsResponse.data);
        setDayBook(daybookResponse.data.transactions || []);
        setTotals(daybookResponse.data.totals || {
          cash: 0,
          upi: 0,
          card: 0,
          totalAmount: 0,
          totalTransactions: 0
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [selectedDate]);

  const exportToCSV = () => {
    if (dayBook.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Date', 'Invoice No.', 'Customer Name', 'Category', 'Sub Category', 'Remarks', 'Amount', 'Cash', 'Card', 'UPI'];
    
    const csvData = dayBook.map(transaction => [
      new Date(transaction.date).toLocaleDateString('en-GB'),
      transaction.invoiceNumber,
      transaction.customerName,
      transaction.category,
      transaction.subCategory,
      transaction.remarks || '',
      transaction.amount,
      transaction.cash || 0,
      transaction.card || 0,
      transaction.upi || 0
    ]);

    // Add totals row
    csvData.push([
      '', '', '', '', '', 'Total:',
      totals.totalAmount,
      totals.cash,
      totals.card,
      totals.upi
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `daybook-${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('PIKTOBOOKS - Day Book Report', 14, 20);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(selectedDate).toLocaleDateString()}`, 14, 30);
    
    // Add stats summary
    doc.setFontSize(14);
    doc.text('Summary', 14, 45);
    doc.setFontSize(10);
    doc.text(`Total Stock: ${stats.totalStock}`, 14, 55);
    doc.text(`Total Sales: ${stats.totalSales}`, 14, 62);
    doc.text(`Total Purchase Value: ₹${stats.totalPurchaseValue.toLocaleString()}`, 14, 69);
    doc.text(`Total Selling Value: ₹${stats.totalSellingValue.toLocaleString()}`, 14, 76);
    doc.text(`Profit: ₹${stats.profit.toLocaleString()}`, 14, 83);
    
    // Add day book table
    if (dayBook.length > 0) {
      const tableData = dayBook.map(transaction => [
        new Date(transaction.date).toLocaleDateString('en-GB'),
        transaction.invoiceNumber,
        transaction.customerName,
        transaction.category,
        transaction.subCategory,
        transaction.remarks || '',
        `₹${transaction.amount.toLocaleString()}`,
        transaction.cash || '',
        transaction.card || '',
        transaction.upi || ''
      ]);
      
      doc.autoTable({
        startY: 95,
        head: [['Date', 'Invoice No.', 'Customer', 'Category', 'Sub Category', 'Remarks', 'Amount', 'Cash', 'Card', 'UPI']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [108, 93, 211] },
        styles: { fontSize: 7 }
      });
      
      // Add totals
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text(`Total Amount: ₹${totals.totalAmount.toLocaleString()}`, 14, finalY);
      doc.text(`Cash: ₹${totals.cash}`, 14, finalY + 7);
      doc.text(`Card: ₹${totals.card}`, 14, finalY + 14);
      doc.text(`UPI: ₹${totals.upi}`, 14, finalY + 21);
    } else {
      doc.setFontSize(12);
      doc.text('No transactions for this date', 14, 95);
    }
    
    // Save the PDF
    doc.save(`daybook-${selectedDate}.pdf`);
  };

  return (
    <Container fluid>
      <div className="page-header">
        <div className="header-actions">
          <Button 
            variant="primary" 
            className="action-btn"
            onClick={() => navigate('/inventory/add')}
          >
            <FaPlus /> New Item
          </Button>
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" className="action-btn">
              <FaFileExport /> Export
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={exportToPDF}>
                <FaFilePdf className="me-2" /> Export as PDF
              </Dropdown.Item>
              <Dropdown.Item onClick={exportToCSV}>
                <FaFileCsv className="me-2" /> Export as CSV
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      <Row className="mb-4 g-3 stats-row">
        <Col md={2} sm={6} xs={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-label">Total Stock</div>
              <div className="stat-value">{stats.totalStock}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} sm={6} xs={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-label">Total Sales</div>
              <div className="stat-value">{stats.totalSales}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} xs={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-label">Total Purchase Value</div>
              <div className="stat-value">₹{stats.totalPurchaseValue.toLocaleString()}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} xs={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-label">Total Selling Value</div>
              <div className="stat-value">₹{stats.totalSellingValue.toLocaleString()}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} sm={6} xs={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-label">Profit</div>
              <div className="stat-value">₹{stats.profit.toLocaleString()}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="daybook-card">
            <Card.Body>
              <div className="daybook-header">
                <h5 className="daybook-title">Day Book</h5>
                <Form.Control
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="date-picker"
                />
              </div>

              <div className="daybook-table-wrapper">
                <Table responsive bordered className="daybook-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Invoice No.</th>
                      <th>Customer Name</th>
                      <th>Category</th>
                      <th>Sub Category</th>
                      <th className="d-none d-lg-table-cell">Remarks</th>
                      <th>Amount</th>
                      <th className="d-none d-lg-table-cell">Cash</th>
                      <th className="d-none d-lg-table-cell">Card</th>
                      <th className="d-none d-lg-table-cell">UPI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayBook.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="text-center text-muted py-4">
                          No transactions for this date
                        </td>
                      </tr>
                    ) : (
                      <>
                        {dayBook.map((transaction, index) => (
                          <tr key={index} className={transaction.isLastItem ? 'invoice-last-row' : ''}>
                            <td>{new Date(transaction.date).toLocaleDateString('en-GB')}</td>
                            <td className="fw-semibold">{transaction.invoiceNumber}</td>
                            <td>{transaction.customerName}</td>
                            <td>{transaction.category}</td>
                            <td>{transaction.subCategory}</td>
                            <td className="d-none d-lg-table-cell">{transaction.remarks}</td>
                            <td className="fw-semibold">₹{transaction.amount.toLocaleString()}</td>
                            <td className="d-none d-lg-table-cell">
                              {transaction.cash ? transaction.cash : ''}
                            </td>
                            <td className="d-none d-lg-table-cell">
                              {transaction.card ? transaction.card : ''}
                            </td>
                            <td className="d-none d-lg-table-cell">
                              {transaction.upi ? transaction.upi : ''}
                            </td>
                          </tr>
                        ))}
                        <tr className="total-row">
                          <td colSpan="6" className="fw-bold">Total:</td>
                          <td className="fw-bold">₹{totals.totalAmount.toLocaleString()}</td>
                          <td className="d-none d-lg-table-cell fw-bold">{totals.cash}</td>
                          <td className="d-none d-lg-table-cell fw-bold">{totals.card}</td>
                          <td className="d-none d-lg-table-cell fw-bold">{totals.upi}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;
