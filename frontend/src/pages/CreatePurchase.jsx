import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';

function CreatePurchase() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    supplierName: '',
    supplierPhone: '',
    date: new Date().toISOString().split('T')[0],
    purchaseNumber: '',
    paymentMethod: 'cash',
    notes: ''
  });

  const [purchaseItems, setPurchaseItems] = useState([
    { itemId: '', itemName: '', quantity: 1, price: 0, total: 0 }
  ]);

  useEffect(() => {
    fetchItems();
    generatePurchaseNumber();
  }, []);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/items', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const generatePurchaseNumber = () => {
    const num = 'PO-' + Date.now().toString().slice(-8);
    setFormData(prev => ({ ...prev, purchaseNumber: num }));
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Prevent scroll wheel from changing number input values
  const handleWheel = (e) => {
    e.target.blur();
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...purchaseItems];
    updatedItems[index][field] = value;

    if (field === 'itemId') {
      const selectedItem = items.find(item => item._id === value);
      if (selectedItem) {
        updatedItems[index].itemName = selectedItem.name;
        updatedItems[index].price = selectedItem.purchasePrice;
        updatedItems[index].total = selectedItem.purchasePrice * updatedItems[index].quantity;
      }
    }

    if (field === 'quantity' || field === 'price') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].price;
    }

    setPurchaseItems(updatedItems);
  };

  const addItem = () => {
    setPurchaseItems([...purchaseItems, { itemId: '', itemName: '', quantity: 1, price: 0, total: 0 }]);
  };

  const removeItem = (index) => {
    if (purchaseItems.length > 1) {
      setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return purchaseItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const purchaseData = {
        ...formData,
        items: purchaseItems.filter(item => item.itemId),
        totalAmount: calculateTotal()
      };

      await axios.post('http://localhost:5000/api/purchases', purchaseData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate('/purchase');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create purchase order');
      setLoading(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Button 
        variant="link" 
        className="text-decoration-none mb-3 p-0"
        onClick={() => navigate('/purchase')}
      >
        <FaArrowLeft className="me-2" /> Back to Purchase Orders
      </Button>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col lg={8}>
            <Card className="mb-4 shadow-sm">
              <Card.Header style={{ backgroundColor: '#6C5DD3', color: 'white' }}>
                <h5 className="mb-0">Supplier Information</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Supplier Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="supplierName"
                        value={formData.supplierName}
                        onChange={handleInputChange}
                        placeholder="Enter supplier name"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="supplierPhone"
                        value={formData.supplierPhone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Purchase Order #</Form.Label>
                      <Form.Control
                        type="text"
                        name="purchaseNumber"
                        value={formData.purchaseNumber}
                        onChange={handleInputChange}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Payment Method</Form.Label>
                      <Form.Select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                      >
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="card">Card</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mb-4 shadow-sm">
              <Card.Header style={{ backgroundColor: '#6C5DD3', color: 'white' }}>
                <h5 className="mb-0">Items</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3" style={{ fontSize: '12px', color: '#6c757d' }}>
                  <span style={{ color: '#198754' }}>● In Stock</span>
                  <span style={{ color: '#fd7e14', marginLeft: '15px' }}>● Low Stock</span>
                  <span style={{ color: '#dc3545', marginLeft: '15px' }}>● Out of Stock</span>
                </div>
                
                <Table responsive bordered hover>
                  <thead className="table-light">
                    <tr>
                      <th>Item</th>
                      <th style={{ width: '120px' }}>Quantity</th>
                      <th style={{ width: '140px' }}>Price</th>
                      <th style={{ width: '140px' }}>Total</th>
                      <th style={{ width: '60px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseItems.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <Form.Select
                            value={item.itemId}
                            onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                            required
                          >
                            <option value="">Select item</option>
                            {items.map(i => {
                              const stockStatus = i.inStock <= 0 ? 'out-of-stock' : 
                                                i.inStock <= i.reorderPoint ? 'low-stock' : 'in-stock';
                              
                              return (
                                <option 
                                  key={i._id} 
                                  value={i._id}
                                  style={{
                                    color: i.inStock <= 0 ? '#dc3545' : i.inStock <= i.reorderPoint ? '#fd7e14' : '#198754'
                                  }}
                                >
                                  {i.name} - Current Stock: {i.inStock}
                                </option>
                              );
                            })}
                          </Form.Select>
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                            onWheel={handleWheel}
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                            onWheel={handleWheel}
                          />
                        </td>
                        <td>
                          <div className="fw-bold pt-2">₹{item.total.toFixed(2)}</div>
                        </td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removeItem(index)}
                            disabled={purchaseItems.length === 1}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={addItem}
                >
                  <FaPlus className="me-2" /> Add Item
                </Button>
              </Card.Body>
            </Card>

            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <Form.Group>
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Add any additional notes..."
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm sticky-top" style={{ top: '20px' }}>
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">Summary</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Items</span>
                  <span className="fw-bold">{purchaseItems.filter(i => i.itemId).length}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span className="fw-bold">₹{calculateTotal().toFixed(2)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <span className="h5">Total Amount</span>
                  <span className="h5 text-success fw-bold">₹{calculateTotal().toFixed(2)}</span>
                </div>

                <div className="d-grid gap-2">
                  <Button 
                    variant="outline-secondary"
                    onClick={() => navigate('/purchase')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="success" 
                    type="submit"
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? 'Creating...' : 'Create Purchase Order'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

export default CreatePurchase;
