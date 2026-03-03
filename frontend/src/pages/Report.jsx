import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Table, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';
import API_BASE_URL from '../config/api.js';
import './Dashboard.css';

function Report() {
  const [activeTab, setActiveTab] = useState('daily');
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reports, setReports] = useState({
    daily: [],
    monthly: [],
    revenue: {},
    invoiceList: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [dateRange, activeTab]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.get(
        `${API_BASE_URL}/api/reports/${activeTab}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        { headers }
      );
      
      setReports(prev => ({ ...prev, [activeTab]: response.data }));
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Container fluid>
      <div className="page-header mb-4">
        <div className="header-actions">
          <Form.Control
            type="date"
            value={dateRange.startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            style={{ width: '180px', marginRight: '10px' }}
          />
          <span className="mx-2">to</span>
          <Form.Control
            type="date"
            value={dateRange.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            style={{ width: '180px' }}
          />
        </div>
      </div>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        <Tab eventKey="daily" title="Daily Sales">
          <Card className="shadow-sm">
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <Table responsive bordered className="daybook-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Total Sales</th>
                      <th>Total Amount</th>
                      <th>Cash</th>
                      <th>UPI</th>
                      <th>Card</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.daily.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          No sales data for selected period
                        </td>
                      </tr>
                    ) : (
                      reports.daily.map((day, index) => (
                        <tr key={index}>
                          <td>{new Date(day.date).toLocaleDateString()}</td>
                          <td>{day.totalSales}</td>
                          <td className="fw-bold">₹{day.totalAmount?.toLocaleString() || 0}</td>
                          <td>₹{day.cash?.toLocaleString() || 0}</td>
                          <td>₹{day.upi?.toLocaleString() || 0}</td>
                          <td>₹{day.card?.toLocaleString() || 0}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="monthly" title="Monthly Sales">
          <Card className="shadow-sm">
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <Table responsive bordered className="daybook-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Total Sales</th>
                      <th>Total Amount</th>
                      <th>Average Per Day</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.monthly.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-4">
                          No sales data for selected period
                        </td>
                      </tr>
                    ) : (
                      reports.monthly.map((month, index) => (
                        <tr key={index}>
                          <td>{month.month}</td>
                          <td>{month.totalSales}</td>
                          <td className="fw-bold">₹{month.totalAmount?.toLocaleString() || 0}</td>
                          <td>₹{month.averagePerDay?.toLocaleString() || 0}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="revenue" title="Revenue Summary">
          <Row>
            <Col md={6}>
              <Card className="shadow-sm mb-4">
                <Card.Header style={{ backgroundColor: '#6C5DD3', color: 'white' }}>
                  <h5 className="mb-0">Sales Summary</h5>
                </Card.Header>
                <Card.Body>
                  {loading ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : (
                    <>
                      <div className="d-flex justify-content-between mb-3 pb-3 border-bottom">
                        <span>Total Sales</span>
                        <span className="fw-bold">{reports.revenue.totalSales || 0}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-3 pb-3 border-bottom">
                        <span>Total Revenue</span>
                        <span className="fw-bold text-success">
                          ₹{reports.revenue.totalRevenue?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-3 pb-3 border-bottom">
                        <span>Total Cost</span>
                        <span className="fw-bold text-danger">
                          ₹{reports.revenue.totalCost?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="h5">Net Profit</span>
                        <span className="h5 fw-bold text-success">
                          ₹{reports.revenue.netProfit?.toLocaleString() || 0}
                        </span>
                      </div>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm mb-4">
                <Card.Header style={{ backgroundColor: '#10B981', color: 'white' }}>
                  <h5 className="mb-0">Payment Methods</h5>
                </Card.Header>
                <Card.Body>
                  {loading ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : (
                    <>
                      <div className="d-flex justify-content-between mb-3 pb-3 border-bottom">
                        <span>Cash</span>
                        <span className="fw-bold">₹{reports.revenue.cash?.toLocaleString() || 0}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-3 pb-3 border-bottom">
                        <span>UPI</span>
                        <span className="fw-bold">₹{reports.revenue.upi?.toLocaleString() || 0}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Card</span>
                        <span className="fw-bold">₹{reports.revenue.card?.toLocaleString() || 0}</span>
                      </div>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="invoiceList" title="Invoice-wise List">
          <Card className="shadow-sm">
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <Table responsive bordered className="daybook-table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Payment</th>
                      <th>Amount</th>
                      <th>Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.invoiceList.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-4">
                          No invoices for selected period
                        </td>
                      </tr>
                    ) : (
                      reports.invoiceList.map((invoice) => (
                        <tr key={invoice._id}>
                          <td className="fw-semibold">{invoice.invoiceNumber}</td>
                          <td>{new Date(invoice.date).toLocaleDateString()}</td>
                          <td>{invoice.customerName}</td>
                          <td>{invoice.itemCount}</td>
                          <td className="text-capitalize">{invoice.paymentMethod}</td>
                          <td className="fw-bold">₹{invoice.totalAmount?.toLocaleString() || 0}</td>
                          <td className="fw-bold text-success">
                            ₹{invoice.profit?.toLocaleString() || 0}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
}

export default Report;
