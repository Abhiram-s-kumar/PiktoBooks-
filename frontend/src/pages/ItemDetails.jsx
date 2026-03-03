import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, InputGroup } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import axios from 'axios';
import './ItemDetails.css';

function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [stockAction, setStockAction] = useState('add');

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItem(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching item:', error);
      setLoading(false);
    }
  };

  // Prevent scroll wheel from changing number input values
  const handleWheel = (e) => {
    e.target.blur();
  };

  const handleStockUpdate = async () => {
    if (stockQuantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const newStock = stockAction === 'add' 
        ? item.inStock + parseInt(stockQuantity)
        : item.inStock - parseInt(stockQuantity);

      if (newStock < 0) {
        alert('Cannot remove more stock than available');
        return;
      }

      await axios.put(`http://localhost:5000/api/items/${id}`, 
        { inStock: newStock },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setItem({ ...item, inStock: newStock });
      setStockQuantity(0);
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/items/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        navigate('/inventory');
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  if (loading) {
    return (
      <Container fluid>
        <div className="text-center py-5">Loading...</div>
      </Container>
    );
  }

  if (!item) {
    return (
      <Container fluid>
        <div className="text-center py-5">Item not found</div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <div className="page-header">
        <Button 
          variant="link" 
          className="back-btn"
          onClick={() => navigate('/inventory')}
        >
          <FaArrowLeft /> Back to Inventory
        </Button>
      </div>

      <Row>
        <Col lg={8}>
          <Card className="item-details-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-sku">SKU: {item.sku}</p>
                </div>
                <div className="item-actions">
                  <Button variant="outline-primary" size="sm" className="me-2">
                    <FaEdit /> Edit
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={handleDelete}>
                    <FaTrash /> Delete
                  </Button>
                </div>
              </div>

              <Row>
                <Col md={6}>
                  <div className="detail-group">
                    <label>Category</label>
                    <p>{item.category}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-group">
                    <label>Size</label>
                    <p>{item.size || '-'}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-group">
                    <label>HSN Code</label>
                    <p>{item.hsnCode || '-'}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-group">
                    <label>In Stock</label>
                    <p className="stock-value">{item.inStock} units</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="item-details-card mt-3">
            <Card.Body>
              <h5 className="section-title">Pricing Information</h5>
              <Table bordered>
                <tbody>
                  <tr>
                    <td className="fw-semibold">Purchase Price</td>
                    <td>₹{item.purchasePrice.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold">Selling Price</td>
                    <td>₹{item.sellingPrice.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold">Profit per Unit</td>
                    <td className="text-success fw-bold">
                      ₹{(item.sellingPrice - item.purchasePrice).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="fw-semibold">Total Stock Value (Purchase)</td>
                    <td>₹{(item.purchasePrice * item.inStock).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold">Total Stock Value (Selling)</td>
                    <td>₹{(item.sellingPrice * item.inStock).toLocaleString()}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="item-details-card">
            <Card.Body>
              <h5 className="section-title">Stock Management</h5>
              
              <div className="stock-display">
                <div className="stock-label">Current Stock</div>
                <div className="stock-number">{item.inStock}</div>
                <div className="stock-unit">units</div>
              </div>

              <div className="stock-actions">
                <div className="action-tabs">
                  <button 
                    className={`action-tab ${stockAction === 'add' ? 'active' : ''}`}
                    onClick={() => setStockAction('add')}
                  >
                    <FaPlus /> Add Stock
                  </button>
                  <button 
                    className={`action-tab ${stockAction === 'remove' ? 'active' : ''}`}
                    onClick={() => setStockAction('remove')}
                  >
                    <FaMinus /> Remove Stock
                  </button>
                </div>

                <InputGroup className="mt-3">
                  <Form.Control
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    onWheel={handleWheel}
                    placeholder="Enter quantity"
                  />
                  <Button 
                    variant={stockAction === 'add' ? 'success' : 'danger'}
                    onClick={handleStockUpdate}
                  >
                    {stockAction === 'add' ? 'Add' : 'Remove'}
                  </Button>
                </InputGroup>
              </div>
            </Card.Body>
          </Card>

          <Card className="item-details-card mt-3">
            <Card.Body>
              <h5 className="section-title">Item Information</h5>
              <div className="info-row">
                <span>Created</span>
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="info-row">
                <span>Last Updated</span>
                <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ItemDetails;
