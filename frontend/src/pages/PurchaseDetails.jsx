import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';

function PurchaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchase();
  }, [id]);

  const fetchPurchase = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/purchases/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPurchase(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching purchase:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container fluid>
        <div className="text-center py-5">Loading...</div>
      </Container>
    );
  }

  if (!purchase) {
    return (
      <Container fluid>
        <div className="text-center py-5">Purchase order not found</div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Button 
        variant="link" 
        className="text-decoration-none mb-3 p-0"
        onClick={() => navigate('/purchase')}
      >
        <FaArrowLeft className="me-2" /> Back to Purchase Orders
      </Button>

      <Row>
        <Col lg={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Header style={{ backgroundColor: '#6C5DD3', color: 'white' }}>
              <h5 className="mb-0">Purchase Order Details</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>PO Number:</strong>
                  <p className="mb-0">{purchase.purchaseNumber}</p>
                </Col>
                <Col md={6}>
                  <strong>Date:</strong>
                  <p className="mb-0">{new Date(purchase.date).toLocaleDateString()}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Supplier Name:</strong>
                  <p className="mb-0">{purchase.supplierName}</p>
                </Col>
                <Col md={6}>
                  <strong>Phone:</strong>
                  <p className="mb-0">{purchase.supplierPhone}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Payment Method:</strong>
                  <p className="mb-0 text-capitalize">{purchase.paymentMethod}</p>
                </Col>
                <Col md={6}>
                  <strong>Status:</strong>
                  <p className="mb-0">
                    <span className={`badge bg-${purchase.status === 'completed' ? 'success' : 'warning'}`}>
                      {purchase.status}
                    </span>
                  </p>
                </Col>
              </Row>
              {purchase.notes && (
                <Row>
                  <Col>
                    <strong>Notes:</strong>
                    <p className="mb-0">{purchase.notes}</p>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Header style={{ backgroundColor: '#6C5DD3', color: 'white' }}>
              <h5 className="mb-0">Items</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive bordered hover>
                <thead className="table-light">
                  <tr>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {purchase.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.itemName}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.price.toLocaleString()}</td>
                      <td>₹{item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Total Items</span>
                <span className="fw-bold">{purchase.items.length}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Total Quantity</span>
                <span className="fw-bold">
                  {purchase.items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <span className="h5">Total Amount</span>
                <span className="h5 text-success fw-bold">
                  ₹{purchase.totalAmount.toLocaleString()}
                </span>
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow-sm mt-3">
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Created</span>
                <span>{new Date(purchase.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Last Updated</span>
                <span>{new Date(purchase.updatedAt).toLocaleDateString()}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default PurchaseDetails;
