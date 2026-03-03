import { useState, useEffect } from 'react';
import { Container, Table, Button, Badge } from 'react-bootstrap';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

function Inventory() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
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

  const getStockClass = (stock, threshold) => {
    if (stock <= threshold) return 'stock-low';
    if (stock <= threshold * 1.5) return 'stock-warning';
    return '';
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
        </div>
      </div>

      <div className="inventory-table">
        <Table hover responsive bordered className="daybook-table">
          <thead>
            <tr>
              <th>PRODUCT</th>
              <th>SKU</th>
              <th>CATEGORY</th>
              <th>IN STOCK</th>
              <th>SELLING PRICE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr 
                key={item._id} 
                onClick={() => navigate(`/inventory/${item._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <div>{item.name}</div>
                  <small className="text-muted">{item.category}</small>
                </td>
                <td>{item.sku}</td>
                <td>{item.category}</td>
                <td className={getStockClass(item.inStock, item.reorderPoint)}>
                  {item.inStock}
                </td>
                <td>₹{item.sellingPrice.toLocaleString()}</td>
                <td>
                  {item.inStock <= item.reorderPoint ? (
                    <Badge bg="danger">Low Stock</Badge>
                  ) : (
                    <Badge bg="success">In Stock</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="text-muted mt-3">
          Showing 1 to {items.length} of {items.length} results
        </div>
      </div>
    </Container>
  );
}

export default Inventory;
