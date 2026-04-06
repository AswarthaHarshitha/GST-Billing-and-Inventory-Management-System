// src/pages/NewInvoice.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, getCustomers, createInvoice } from '../api';

const today = () => new Date().toISOString().split('T')[0];
const fmt   = (n) => Number(n || 0).toFixed(2);

export default function NewInvoice() {
  const navigate = useNavigate();
  const [products,  setProducts]  = useState([]);
  const [customers, setCustomers] = useState([]);
  const [custId,    setCustId]    = useState('');
  const [date,      setDate]      = useState(today());
  const [payStatus, setPayStatus] = useState('PAID');
  const [notes,     setNotes]     = useState('');
  const [items,     setItems]     = useState([{ productId: '', qty: 1, rate: '' }]);
  const [msg,       setMsg]       = useState('');
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    getProducts().then(r  => setProducts(r.data));
    getCustomers().then(r => setCustomers(r.data));
  }, []);

  // ── Item helpers ─────────────────────────────────────────────────────────
  const addItem    = () => setItems([...items, { productId: '', qty: 1, rate: '' }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const updateItem = (idx, key, val) => {
    const next = [...items];
    next[idx] = { ...next[idx], [key]: val };
    if (key === 'productId') {
      const p = products.find(p => String(p.id) === String(val));
      if (p) next[idx].rate = p.sellingPrice;
    }
    setItems(next);
  };

  // ── Live totals ──────────────────────────────────────────────────────────
  const customer = customers.find(c => String(c.id) === String(custId));
  const isInterstate = customer?.stateCode && customer.stateCode !== '37';

  const calcItem = (item) => {
    const p = products.find(p => String(p.id) === String(item.productId));
    if (!p) return { taxable: 0, tax: 0, total: 0 };
    const taxable = Number(item.qty) * Number(item.rate);
    const gstAmt  = taxable * Number(p.gstRate) / 100;
    return { taxable, tax: gstAmt, total: taxable + gstAmt, gstRate: p.gstRate };
  };

  const totals = items.reduce((acc, item) => {
    const c = calcItem(item);
    return { taxable: acc.taxable + c.taxable, tax: acc.tax + c.tax, total: acc.total + c.total };
  }, { taxable: 0, tax: 0, total: 0 });

  // ── Submit ───────────────────────────────────────────────────────────────
  const submit = async () => {
    if (!custId) { setMsg('Please select a customer.'); return; }
    if (items.some(i => !i.productId || !i.qty || !i.rate)) { setMsg('Fill all item fields.'); return; }

    setSaving(true);
    try {
      const payload = {
        invoiceDate: date,
        paymentStatus: payStatus,
        notes,
        customer: { id: parseInt(custId) },
        items: items.map(i => ({
          product: { id: parseInt(i.productId) },
          quantity: i.qty,
          rate: i.rate
        }))
      };
      const res = await createInvoice(payload);
      navigate(`/invoices/${res.data.id}`);
    } catch (e) {
      setMsg('Error: ' + (e.response?.data?.message || e.message));
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">New Bill</div>
          <div className="page-sub">Create GST invoice</div>
        </div>
      </div>

      {msg && <div className="alert alert-danger">{msg}</div>}

      {/* Bill details */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Bill Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Customer *</label>
            <select value={custId} onChange={e => setCustId(e.target.value)}>
              <option value="">-- Select Customer --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.state}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Bill Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Payment Status</label>
            <select value={payStatus} onChange={e => setPayStatus(e.target.value)}>
              <option>PAID</option><option>PENDING</option><option>PARTIAL</option>
            </select>
          </div>
          {customer && (
            <div className="form-group">
              <label>Supply Type</label>
              <input value={isInterstate ? '🔄 INTERSTATE (IGST)' : '🏠 INTRASTATE (CGST+SGST)'} readOnly style={{ background: '#f5f7fa' }} />
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>Items</h3>
          <button className="btn btn-outline btn-sm" onClick={addItem}>➕ Add Item</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 260 }}>Product</th>
                <th>Qty</th>
                <th>Rate (₹)</th>
                <th>Taxable</th>
                <th>GST</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const c = calcItem(item);
                const p = products.find(p => String(p.id) === String(item.productId));
                return (
                  <tr key={idx}>
                    <td>
                      <select value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', border: '1.5px solid #dde1ea', borderRadius: 6 }}>
                        <option value="">-- Select --</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQty} {p.unit})</option>)}
                      </select>
                    </td>
                    <td>
                      <input type="number" value={item.qty} min="1"
                        onChange={e => updateItem(idx, 'qty', e.target.value)}
                        style={{ width: 70, padding: '6px 8px', border: '1.5px solid #dde1ea', borderRadius: 6 }} />
                    </td>
                    <td>
                      <input type="number" value={item.rate}
                        onChange={e => updateItem(idx, 'rate', e.target.value)}
                        style={{ width: 90, padding: '6px 8px', border: '1.5px solid #dde1ea', borderRadius: 6 }} />
                    </td>
                    <td>₹{fmt(c.taxable)}</td>
                    <td>{p ? <span className="badge badge-blue">{p.gstRate}%</span> : '-'}</td>
                    <td><strong>₹{fmt(c.total)}</strong></td>
                    <td>
                      {items.length > 1 &&
                        <button className="btn btn-danger btn-sm" onClick={() => removeItem(idx)}>✕</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals summary */}
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ minWidth: 300 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' }}>
              <span>Taxable Value</span>
              <strong>₹{fmt(totals.taxable)}</strong>
            </div>
            {isInterstate ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' }}>
                <span>IGST</span><strong>₹{fmt(totals.tax)}</strong>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' }}>
                  <span>CGST</span><strong>₹{fmt(totals.tax / 2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' }}>
                  <span>SGST</span><strong>₹{fmt(totals.tax / 2)}</strong>
                </div>
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 18, fontWeight: 700, color: '#4f8ef7' }}>
              <span>Grand Total</span>
              <span>₹{fmt(totals.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes + submit */}
      <div className="card">
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label>Notes (optional)</label>
          <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Any remarks..." style={{ padding: '9px 12px', border: '1.5px solid #dde1ea', borderRadius: 8 }} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-success" onClick={submit} disabled={saving}>
            {saving ? '⏳ Saving...' : '✅ Create Bill'}
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/invoices')}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
