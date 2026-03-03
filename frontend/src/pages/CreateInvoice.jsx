import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import './CreateInvoice.css';

function CreateInvoice() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    date: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    category: '',
    paymentMethod: 'cash'
  });

  const [invoiceItems, setInvoiceItems] = useState([
    { itemId: '', itemName: '', quantity: 1, price: 0, total: 0 }
  ]);

  useEffect(() => {
    fetchItems();
    generateInvoiceNumber();
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

  const generateInvoiceNumber = () => {
    const num = 'INV-' + Date.now().toString().slice(-8);
    setFormData(prev => ({ ...prev, invoiceNumber: num }));
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Prevent scroll wheel from changing number input values
  const handleWheel = (e) => {
    e.target.blur();
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index][field] = value;

    if (field === 'itemId') {
      const selectedItem = items.find(item => item._id === value);
      if (selectedItem) {
        if (selectedItem.inStock <= 0) {
          setError('Selected item is out of stock!');
          return;
        }
        updatedItems[index].itemName = selectedItem.name;
        updatedItems[index].price = selectedItem.sellingPrice;
        updatedItems[index].total = selectedItem.sellingPrice * updatedItems[index].quantity;
        updatedItems[index].maxStock = selectedItem.inStock;
      }
    }

    if (field === 'quantity') {
      const selectedItem = items.find(item => item._id === updatedItems[index].itemId);
      if (selectedItem && value > selectedItem.inStock) {
        setError(`Only ${selectedItem.inStock} units available in stock!`);
        return;
      }
      updatedItems[index].total = value * updatedItems[index].price;
    }

    if (field === 'price') {
      updatedItems[index].total = updatedItems[index].quantity * value;
    }

    setInvoiceItems(updatedItems);
  };

  const addItem = () => {
    setInvoiceItems([...invoiceItems, { itemId: '', itemName: '', quantity: 1, price: 0, total: 0 }]);
  };

  const removeItem = (index) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const invoiceData = {
        ...formData,
        items: invoiceItems.filter(item => item.itemId),
        totalAmount: calculateTotal()
      };

      await axios.post('http://localhost:5000/api/invoices', invoiceData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate('/invoice');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create invoice');
      setLoading(false);
    }
  };

  return (
    <Container fluid>
      <div className="page-header">
        <Button 
          variant="link" 
          className="back-btn"
          onClick={() => navigate('/invoice')}
        >
          <FaArrowLeft /> Back to Invoices
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col lg={8}>
            <Card className="invoice-card mb-4">
              <Card.Body>
                <h5 className="section-title">Customer Information</h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Customer Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        placeholder="Enter customer name"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <h5 className="section-title mt-4">Invoice Details</h5>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Invoice Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="invoiceNumber"
                        value={formData.invoiceNumber}
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
                      <Form.Label>Category</Form.Label>
                      <Form.Control
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        placeholder="e.g., Retail, Wholesale"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <h5 className="section-title mt-4">Items</h5>
                
                <div className="mb-3" style={{ fontSize: '12px', color: '#6c757d' }}>
                  <span style={{ color: '#198754' }}>● In Stock</span>
                  <span style={{ color: '#fd7e14', marginLeft: '15px' }}>● Low Stock</span>
                  <span style={{ color: '#dc3545', marginLeft: '15px' }}>● Out of Stock (Cannot select)</span>
                </div>

                <div className="items-table">
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th style={{ width: '120px' }}>Quantity</th>
                        <th style={{ width: '140px' }}>Price</th>
                        <th style={{ width: '140px' }}>Total</th>
                        <th style={{ width: '60px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceItems.map((item, index) => (
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
                                const stockText = i.inStock <= 0 ? 'No Stock' : `Stock: ${i.inStock}`;
                                
                                return (
                                  <option 
                                    key={i._id} 
                                    value={i._id}
                                    style={{
                                      color: i.inStock <= 0 ? '#dc3545' : i.inStock <= i.reorderPoint ? '#fd7e14' : '#198754',
                                      fontWeight: i.inStock <= 0 ? 'bold' : 'normal'
                                    }}
                                    disabled={i.inStock <= 0}
                                  >
                                    {i.name} - {stockText}
                                  </option>
                                );
                              })}
                            </Form.Select>
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              min="1"
                              max={item.itemId ? items.find(i => i._id === item.itemId)?.inStock : undefined}
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                              onWheel={handleWheel}
                              placeholder={item.itemId ? `Max: ${items.find(i => i._id === item.itemId)?.inStock || 0}` : ''}
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
                            <div className="total-display">₹{item.total.toFixed(2)}</div>
                          </td>
                          <td>
                            <Button
                              variant="link"
                              className="remove-btn"
                              onClick={() => removeItem(index)}
                              disabled={invoiceItems.length === 1}
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
                    className="add-item-btn"
                  >
                    <FaPlus /> Add Item
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="invoice-card summary-card">
              <Card.Body>
                <h5 className="section-title">Payment Details</h5>
                
                <Form.Group className="mb-4">
                  <Form.Label>Payment Method</Form.Label>
                  <div className="payment-methods">
                    {['cash', 'upi', 'card'].map(method => (
                      <Form.Check
                        key={method}
                        type="radio"
                        id={method}
                        name="paymentMethod"
                        label={method.toUpperCase()}
                        value={method}
                        checked={formData.paymentMethod === method}
                        onChange={handleInputChange}
                        className="payment-option"
                      />
                    ))}
                  </div>
                </Form.Group>

                <div className="summary-section">
                  <h5 className="section-title">Summary</h5>
                  <div className="summary-row">
                    <span>Items</span>
                    <span>{invoiceItems.filter(i => i.itemId).length}</span>
                  </div>
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="summary-row total-row">
                    <span>Total Amount</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="action-buttons">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => navigate('/invoice')}
                    disabled={loading}
                    className="w-100 mb-2"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={loading}
                    className="w-100"
                  >
                    {loading ? 'Creating...' : 'Create Invoice'}
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

export default CreateInvoice;
