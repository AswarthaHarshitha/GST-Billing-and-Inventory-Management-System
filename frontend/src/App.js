// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import NewInvoice from './pages/NewInvoice';
import InvoiceList from './pages/InvoiceList';
import InvoiceView from './pages/InvoiceView';
import GstReport from './pages/GstReport';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="sidebar">
          <div className="brand">
            <div className="brand-icon">🏪</div>
            <div>
              <div className="brand-name">WholeSale GST</div>
              <div className="brand-sub">Billing System</div>
            </div>
          </div>

          <NavLink to="/" end className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            📊 Dashboard
          </NavLink>
          <NavLink to="/invoice/new" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            ➕ New Bill
          </NavLink>
          <NavLink to="/invoices" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            🧾 All Bills
          </NavLink>
          <NavLink to="/products" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            📦 Products
          </NavLink>
          <NavLink to="/customers" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            👥 Customers
          </NavLink>
          <NavLink to="/gst-report" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            📋 GST Report
          </NavLink>

          <div className="sidebar-footer">
            <a href="http://localhost:8080/h2-console" target="_blank" rel="noreferrer" className="nav-link">
              🗄️ H2 Console
            </a>
          </div>
        </nav>

        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/invoice/new" element={<NewInvoice />} />
            <Route path="/invoices" element={<InvoiceList />} />
            <Route path="/invoices/:id" element={<InvoiceView />} />
            <Route path="/gst-report" element={<GstReport />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
