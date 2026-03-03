import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import API_BASE_URL from '../config/api.js';
import './AddItem.css';

function AddItem() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    size: '',
    hsnCode: '',
    purchasePrice: '',
    sellingPrice: '',
    reorderPoint: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/items`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/inventory');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item. Please try again.');
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.target.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  // Prevent scroll wheel from changing number input values
  const handleWheel = (e) => {
    e.target.blur();
  };

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

      <Card className="add-item-card">
        <Card.Body>
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Item Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter item name"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Item SKU</Form.Label>
                  <Form.Control
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="Enter SKU"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Enter category"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Size</Form.Label>
                  <Form.Control
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    placeholder="Enter size"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>HSN Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="hsnCode"
                    value={formData.hsnCode}
                    onChange={handleChange}
                    placeholder="Enter HSN code"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Purchase Price</Form.Label>
                  <Form.Control
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    onWheel={handleWheel}
                    placeholder="Enter purchase price"
                    step="0.01"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Selling Price</Form.Label>
                  <Form.Control
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleChange}
                    onWheel={handleWheel}
                    placeholder="Enter selling price"
                    step="0.01"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Reorder Point</Form.Label>
                  <Form.Control
                    type="number"
                    name="reorderPoint"
                    value={formData.reorderPoint}
                    onChange={handleChange}
                    onWheel={handleWheel}
                    placeholder="Enter reorder point"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="form-actions">
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/inventory')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Item'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AddItem;
