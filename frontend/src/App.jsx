import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import AddItem from './pages/AddItem';
import ItemDetails from './pages/ItemDetails';
import Invoice from './pages/Invoice';
import CreateInvoice from './pages/CreateInvoice';
import Purchase from './pages/Purchase';
import CreatePurchase from './pages/CreatePurchase';
import PurchaseDetails from './pages/PurchaseDetails';
import Report from './pages/Report';
import Layout from './components/Layout';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Routes>
      <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="inventory/add" element={<AddItem />} />
        <Route path="inventory/:id" element={<ItemDetails />} />
        <Route path="invoice" element={<Invoice />} />
        <Route path="invoice/create" element={<CreateInvoice />} />
        <Route path="purchase" element={<Purchase />} />
        <Route path="purchase/create" element={<CreatePurchase />} />
        <Route path="purchase/:id" element={<PurchaseDetails />} />
        <Route path="report" element={<Report />} />
      </Route>
    </Routes>
  );
}

export default App;
