import { useState, useEffect } from 'react';
import { Container, Table, Button, Badge } from 'react-bootstrap';
import { FaPlus, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api.js';
import './Dashboard.css';

function Purchase() {
  const [purchases, setPurchases] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/purchases`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPurchases(response.data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      completed: 'success',
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
            onClick={() => navigate('/purchase/create')}
          >
            <FaPlus /> New Purchase Order
          </Button>
        </div>
      </div>

      <div className="inventory-table">
        <Table hover responsive bordered className="daybook-table">
          <thead>
            <tr>
              <th>PO #</th>
              <th>SUPPLIER</th>
              <th>PHONE</th>
              <th>DATE</th>
              <th>PAYMENT</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  No purchase orders found. Create your first purchase order!
                </td>
              </tr>
            ) : (
              purchases.map((purchase) => (
                <tr 
                  key={purchase._id} 
                  onClick={() => navigate(`/purchase/${purchase._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="fw-semibold">{purchase.purchaseNumber}</td>
                  <td>{purchase.supplierName}</td>
                  <td>{purchase.supplierPhone}</td>
                  <td>{new Date(purchase.date).toLocaleDateString()}</td>
                  <td>
                    <span className="text-capitalize">{purchase.paymentMethod}</span>
                  </td>
                  <td className="fw-semibold">₹{purchase.totalAmount.toLocaleString()}</td>
                  <td>{getStatusBadge(purchase.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
        {purchases.length > 0 && (
          <div className="text-muted mt-3">
            Showing {purchases.length} purchase order{purchases.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </Container>
  );
}

export default Purchase;
