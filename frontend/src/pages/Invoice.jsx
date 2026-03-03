import { useState, useEffect } from 'react';
import { Container, Table, Button, Badge } from 'react-bootstrap';
import { FaPlus, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api.js';
import './Dashboard.css';

function Invoice() {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/invoices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      paid: 'success',
      cancelled: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <Container fluid>
      <div className="page-header">
        <div className="header-actions">
          <Button 
            variant="primary" 
            className="action-btn"
            onClick={() => navigate('/invoice/create')}
          >
            <FaPlus /> New Invoice
          </Button>
        </div>
      </div>

      <div className="inventory-table">
        <Table hover responsive bordered className="daybook-table">
          <thead>
            <tr>
              <th>INVOICE #</th>
              <th>CUSTOMER</th>
              <th>PHONE</th>
              <th>DATE</th>
              <th>PAYMENT</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  No invoices found. Create your first invoice!
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice._id}>
                  <td className="fw-semibold">{invoice.invoiceNumber}</td>
                  <td>{invoice.customerName}</td>
                  <td>{invoice.phoneNumber}</td>
                  <td>{new Date(invoice.date).toLocaleDateString()}</td>
                  <td>
                    <span className="text-capitalize">{invoice.paymentMethod}</span>
                  </td>
                  <td className="fw-semibold">₹{invoice.totalAmount.toLocaleString()}</td>
                  <td>{getStatusBadge(invoice.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
        {invoices.length > 0 && (
          <div className="text-muted mt-3">
            Showing {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </Container>
  );
}

export default Invoice;
