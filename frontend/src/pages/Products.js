// src/pages/Products.js
import React, { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api';

const EMPTY = { name: '', hsnCode: '', unit: 'KG', purchasePrice: '', sellingPrice: '', gstRate: '5', stockQty: '', category: 'FOOD_GRAIN' };
const UNITS = ['KG', 'LTR', 'BAG', 'QUINTAL', 'PIECE'];
const CATS  = ['FOOD_GRAIN', 'EDIBLE_OIL', 'SPICES', 'OTHER'];
const GST_RATES = ['0', '5', '12', '18', '28'];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm]         = useState(EMPTY);
  const [editing, setEditing]   = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg]           = useState('');

  const load = () => getProducts().then(r => setProducts(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name || !form.sellingPrice) { setMsg('Name and selling price are required.'); return; }
    try {
      if (editing) await updateProduct(editing, form);
      else         await createProduct(form);
      setMsg('Saved!'); setForm(EMPTY); setEditing(null); setShowForm(false); load();
    } catch (e) { setMsg('Error: ' + (e.response?.data?.message || e.message)); }
  };

  const edit = (p) => { setForm({ ...p }); setEditing(p.id); setShowForm(true); setMsg(''); };

  const del = async (id) => {
    if (window.confirm('Delete this product?')) {
      await deleteProduct(id); load();
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Products</div>
          <div className="page-sub">Sugar · Atta · Oil · Rice and more</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setEditing(null); setShowForm(true); setMsg(''); }}>
          ➕ Add Product
        </button>
      </div>

      {msg && <div className={`alert ${msg.startsWith('Error') ? 'alert-danger' : 'alert-success'}`}>{msg}</div>}

      {showForm && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>{editing ? 'Edit Product' : 'Add New Product'}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g., Sugar" />
            </div>
            <div className="form-group">
              <label>HSN Code</label>
              <input value={form.hsnCode} onChange={e => setForm({...form, hsnCode: e.target.value})} placeholder="e.g., 1701" />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Purchase Price (₹)</label>
              <input type="number" value={form.purchasePrice} onChange={e => setForm({...form, purchasePrice: e.target.value})} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Selling Price (₹) *</label>
              <input type="number" value={form.sellingPrice} onChange={e => setForm({...form, sellingPrice: e.target.value})} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>GST Rate (%)</label>
              <select value={form.gstRate} onChange={e => setForm({...form, gstRate: e.target.value})}>
                {GST_RATES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Stock Quantity</label>
              <input type="number" value={form.stockQty} onChange={e => setForm({...form, stockQty: e.target.value})} placeholder="0" />
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <button className="btn btn-success" onClick={save}>💾 Save</button>
            <button className="btn btn-outline" onClick={() => { setShowForm(false); setMsg(''); }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>HSN</th><th>Unit</th><th>Purchase ₹</th><th>Sell ₹</th><th>GST %</th><th>Stock</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td><span className="badge badge-gray">{p.hsnCode}</span></td>
                  <td>{p.unit}</td>
                  <td>₹{Number(p.purchasePrice).toFixed(2)}</td>
                  <td>₹{Number(p.sellingPrice).toFixed(2)}</td>
                  <td><span className="badge badge-blue">{p.gstRate}%</span></td>
                  <td>
                    <span className={`badge ${p.stockQty < 10 ? 'badge-red' : p.stockQty < 50 ? 'badge-amber' : 'badge-green'}`}>
                      {p.stockQty}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" style={{ marginRight: 6 }} onClick={() => edit(p)}>✏️ Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => del(p.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
