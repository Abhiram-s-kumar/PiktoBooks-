import { Navbar, Container, Dropdown } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/inventory') return 'Stock Management';
    if (path.startsWith('/inventory/add')) return 'Add New Item';
    if (path === '/invoice') return 'Invoices';
    if (path.startsWith('/invoice/create')) return 'Create Invoice';
    if (path === '/purchase') return 'Purchase Orders';
    if (path.startsWith('/purchase/create')) return 'Create Purchase Order';
    if (path === '/report') return 'Reports & Analytics';
    return 'Dashboard';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Navbar className="header-navbar">
      <Container fluid>
        <Navbar.Brand className="page-title">
          {getPageTitle()}
        </Navbar.Brand>
        <Navbar.Collapse className="justify-content-end">
          <Dropdown align="end">
            <Dropdown.Toggle variant="link" className="user-dropdown">
              <div className="user-info">
                <div className="user-avatar">
                  {user.name?.charAt(0) || 'A'}
                </div>
                <div className="user-details">
                  <div className="user-name">{user.name || 'Abhiram'}</div>
                  <div className="user-role">Account</div>
                </div>
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
