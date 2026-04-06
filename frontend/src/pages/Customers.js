// src/pages/Customers.js
import React, { useEffect, useState } from 'react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api';

const EMPTY = { name: '', phone: '', email: '', address: '', gstin: '', state: 'Andhra Pradesh', stateCode: '37', isGstRegistered: false, creditLimit: 0, outstandingAmount: 0 };

const STATES = [
  { name: 'Andhra Pradesh', code: '37' }, { name: 'Telangana', code: '36' },
  { name: 'Karnataka', code: '29' }, { name: 'Tamil Nadu', code: '33' },
  { name: 'Maharashtra', code: '27' }, { name: 'Delhi', code: '07' },
  { name: 'Gujarat', code: '24' }, { name: 'Rajasthan', code: '08' },
  { name: 'West Bengal', code: '19' }, { name: 'Uttar Pradesh', code: '09' },
];

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm]           = useState(EMPTY);
  const [editing, setEditing]     = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [msg, setMsg]             = useState('');

  const load = () => getCustomers().then(r => setCustomers(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name) { setMsg('Name is required.'); return; }
    try {
      if (editing) await updateCustomer(editing, form);
      else         await createCustomer(form);
      setMsg('Saved!'); setForm(EMPTY); setEditing(null); setShowForm(false); load();
    } catch (e) { setMsg('Error: ' + (e.response?.data?.message || e.message)); }
  };

  const edit = (c) => { setForm({ ...c }); setEditing(c.id); setShowForm(true); setMsg(''); };
  const del  = async (id) => { if (window.confirm('Delete?')) { await deleteCustomer(id); load(); } };

  const handleStateChange = (stateName) => {
    const s = STATES.find(s => s.name === stateName);
    setForm({ ...form, state: stateName, stateCode: s ? s.code : '' });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Customers</div>
          <div className="page-sub">Retailers and buyers</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setEditing(null); setShowForm(true); setMsg(''); }}>
          ➕ Add Customer
        </button>
      </div>

      {msg && <div className={`alert ${msg.startsWith('Error') ? 'alert-danger' : 'alert-success'}`}>{msg}</div>}

      {showForm && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>{editing ? 'Edit Customer' : 'Add Customer'}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Shop / Person name" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="9876543210" />
            </div>
            <div className="form-group">
              <label>GSTIN</label>
              <input value={form.gstin} onChange={e => setForm({...form, gstin: e.target.value})} placeholder="27AABCA1234B1Z5" />
            </div>
            <div className="form-group">
              <label>State</label>
              <select value={form.state} onChange={e => handleStateChange(e.target.value)}>
                {STATES.map(s => <option key={s.code} value={s.name}>{s.name} ({s.code})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Credit Limit (₹)</label>
              <input type="number" value={form.creditLimit} onChange={e => setForm({...form, creditLimit: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Outstanding (₹)</label>
              <input type="number" value={form.outstandingAmount} onChange={e => setForm({...form, outstandingAmount: e.target.value})} />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Address</label>
              <textarea rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Full address" style={{ padding: '9px 12px', border: '1.5px solid #dde1ea', borderRadius: 8 }} />
            </div>
            <div className="form-group">
              <label style={{ flexDirection: 'row', alignItems: 'center', gap: 8, display: 'flex' }}>
                <input type="checkbox" checked={form.isGstRegistered} onChange={e => setForm({...form, isGstRegistered: e.target.checked})} />
                GST Registered
              </label>
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
              <tr><th>Name</th><th>Phone</th><th>GSTIN</th><th>State</th><th>Outstanding</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.phone}</td>
                  <td><span className="badge badge-gray">{c.gstin || 'Unregistered'}</span></td>
                  <td>{c.state} <span className="badge badge-blue">{c.stateCode}</span></td>
                  <td>
                    {c.outstandingAmount > 0
                      ? <span className="badge badge-red">₹{Number(c.outstandingAmount).toLocaleString('en-IN')}</span>
                      : <span className="badge badge-green">Clear</span>}
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" style={{ marginRight: 6 }} onClick={() => edit(c)}>✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => del(c.id)}>🗑️</button>
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
