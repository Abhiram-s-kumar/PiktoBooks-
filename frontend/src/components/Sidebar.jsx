import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaChartLine, FaBoxes, FaFileInvoice, FaShoppingCart, FaChartBar } from 'react-icons/fa';
import './Sidebar.css';

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: <FaChartLine />, label: 'Dashboard' },
    { path: '/inventory', icon: <FaBoxes />, label: 'Inventory' },
    { path: '/invoice', icon: <FaFileInvoice />, label: 'Invoice' },
    { path: '/purchase', icon: <FaShoppingCart />, label: 'Purchase' },
    { path: '/report', icon: <FaChartBar />, label: 'Report' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">PB</div>
          <span className="logo-text">PIKTOBOOKS</span>
        </div>
      </div>
      
      <div className="sidebar-menu">
        <Nav className="flex-column">
          {menuItems.map((item) => (
            <Nav.Link
              key={item.path}
              as={Link}
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </Nav.Link>
          ))}
        </Nav>
      </div>
    </div>
  );
}

export default Sidebar;
