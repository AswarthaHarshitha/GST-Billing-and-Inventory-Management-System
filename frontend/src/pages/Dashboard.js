// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard, getInvoices, getLowStock } from '../api';

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    getDashboard().then(r => setStats(r.data)).catch(() => {});
    getInvoices().then(r => setInvoices(r.data.slice(-5).reverse())).catch(() => {});
    getLowStock().then(r => setLowStock(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">This month's summary</div>
        </div>
        <Link to="/invoice/new" className="btn btn-primary">➕ New Bill</Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card blue">
          <div className="stat-label">Total Sales (This Month)</div>
          <div className="stat-value">{fmt(stats?.grandTotal)}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Taxable Value</div>
          <div className="stat-value">{fmt(stats?.taxableValue)}</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-label">Total Tax Collected</div>
          <div className="stat-value">{fmt(stats?.totalTax)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Invoices This Month</div>
          <div className="stat-value">{stats?.totalInvoices || 0}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* GST Breakup */}
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>GST Breakup (This Month)</h3>
          <table>
            <tbody>
              <tr><td>CGST</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(stats?.cgst)}</td></tr>
              <tr><td>SGST</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(stats?.sgst)}</td></tr>
              <tr><td>IGST</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(stats?.igst)}</td></tr>
              <tr style={{ borderTop: '2px solid #eee' }}>
                <td><strong>Total Tax</strong></td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: '#4f8ef7' }}>{fmt(stats?.totalTax)}</td>
              </tr>
            </tbody>
          </table>
          <Link to="/gst-report" style={{ display: 'block', marginTop: 14, fontSize: 13, color: '#4f8ef7' }}>
            View Full GST Report →
          </Link>
        </div>

        {/* Low Stock Alert */}
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>⚠️ Low Stock Alert</h3>
          {lowStock.length === 0 ? (
            <div style={{ color: '#22c55e', fontSize: 14 }}>✅ All products well-stocked</div>
          ) : (
            <table>
              <thead><tr><th>Product</th><th>Stock</th><th>Unit</th></tr></thead>
              <tbody>
                {lowStock.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><span className="badge badge-red">{p.stockQty}</span></td>
                    <td>{p.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16 }}>Recent Bills</h3>
          <Link to="/invoices" className="btn btn-outline btn-sm">View All</Link>
        </div>
        {invoices.length === 0 ? (
          <div className="empty">No bills yet. <Link to="/invoice/new">Create your first bill →</Link></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Invoice No</th><th>Date</th><th>Customer</th><th>Grand Total</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td><strong>{inv.invoiceNumber}</strong></td>
                    <td>{inv.invoiceDate}</td>
                    <td>{inv.customer?.name}</td>
                    <td><strong>{fmt(inv.grandTotal)}</strong></td>
                    <td>
                      <span className={`badge ${inv.paymentStatus === 'PAID' ? 'badge-green' : inv.paymentStatus === 'PENDING' ? 'badge-amber' : 'badge-blue'}`}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td><Link to={`/invoices/${inv.id}`} className="btn btn-outline btn-sm">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
