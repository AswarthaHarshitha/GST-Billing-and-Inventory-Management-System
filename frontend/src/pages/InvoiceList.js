// src/pages/InvoiceList.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInvoices, getInvoicesByRange } from '../api';

const today = () => new Date().toISOString().split('T')[0];
const monthStart = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [from, setFrom]         = useState(monthStart());
  const [to,   setTo]           = useState(today());
  const [search, setSearch]     = useState('');

  const load = () => {
    getInvoicesByRange(from, to).then(r => setInvoices(r.data)).catch(() => getInvoices().then(r => setInvoices(r.data)));
  };

  useEffect(() => { getInvoices().then(r => setInvoices(r.data)); }, []);

  const filtered = invoices.filter(inv =>
    !search ||
    inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
    inv.customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const total = filtered.reduce((sum, i) => sum + Number(i.grandTotal || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">All Bills</div>
          <div className="page-sub">{filtered.length} invoices</div>
        </div>
        <Link to="/invoice/new" className="btn btn-primary">➕ New Bill</Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group">
            <label>From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div className="form-group">
            <label>To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={load}>🔍 Filter</button>
          <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
            <label>Search</label>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Invoice no or customer name..." />
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#888' }}>{filtered.length} records</span>
          <strong style={{ color: '#4f8ef7', fontSize: 16 }}>Total: {fmt(total)}</strong>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Invoice No</th><th>Date</th><th>Customer</th>
                <th>Taxable</th><th>CGST</th><th>SGST</th><th>IGST</th>
                <th>Grand Total</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 32, color: '#aaa' }}>No invoices found</td></tr>
              ) : filtered.map(inv => (
                <tr key={inv.id}>
                  <td><strong>{inv.invoiceNumber}</strong></td>
                  <td>{inv.invoiceDate}</td>
                  <td>{inv.customer?.name}</td>
                  <td>{fmt(inv.subtotal)}</td>
                  <td>{fmt(inv.cgstAmount)}</td>
                  <td>{fmt(inv.sgstAmount)}</td>
                  <td>{fmt(inv.igstAmount)}</td>
                  <td><strong style={{ color: '#4f8ef7' }}>{fmt(inv.grandTotal)}</strong></td>
                  <td>
                    <span className={`badge ${inv.paymentStatus === 'PAID' ? 'badge-green' : inv.paymentStatus === 'PENDING' ? 'badge-amber' : 'badge-blue'}`}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td><Link to={`/invoices/${inv.id}`} className="btn btn-outline btn-sm">🖨️ View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
