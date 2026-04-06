// src/pages/GstReport.js
import React, { useState } from 'react';
import { getGstReport, getInvoicesByRange } from '../api';

const today      = () => new Date().toISOString().split('T')[0];
const monthStart = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
const fmt  = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
const fmtN = (n) => Number(n || 0).toFixed(2);

export default function GstReport() {
  const [from,     setFrom]     = useState(monthStart());
  const [to,       setTo]       = useState(today());
  const [report,   setReport]   = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading,  setLoading]  = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const [r, invs] = await Promise.all([
        getGstReport(from, to),
        getInvoicesByRange(from, to)
      ]);
      setReport(r.data);
      setInvoices(invs.data);
    } finally {
      setLoading(false);
    }
  };

  // HSN summary from invoice items
  const hsnSummary = {};
  invoices.forEach(inv => {
    inv.items?.forEach(item => {
      const k = item.hsnCode || 'N/A';
      if (!hsnSummary[k]) hsnSummary[k] = { hsn: k, name: item.productName, taxable: 0, cgst: 0, sgst: 0, igst: 0 };
      hsnSummary[k].taxable += Number(item.taxableValue || 0);
      hsnSummary[k].cgst    += Number(item.cgstAmount || 0);
      hsnSummary[k].sgst    += Number(item.sgstAmount || 0);
      hsnSummary[k].igst    += Number(item.igstAmount || 0);
    });
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">GST Report</div>
          <div className="page-sub">GSTR-1 / GSTR-3B Summary</div>
        </div>
        <button className="btn btn-primary no-print" onClick={() => window.print()}>🖨️ Print Report</button>
      </div>

      {/* Date range selector */}
      <div className="card no-print">
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group">
            <label>From Date</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div className="form-group">
            <label>To Date</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={generate} disabled={loading}>
            {loading ? '⏳ Generating...' : '📊 Generate Report'}
          </button>
          {/* Quick filters */}
          <button className="btn btn-outline btn-sm" onClick={() => {
            setFrom(monthStart()); setTo(today());
          }}>This Month</button>
          <button className="btn btn-outline btn-sm" onClick={() => {
            const d = new Date();
            const q = Math.floor(d.getMonth() / 3);
            setFrom(new Date(d.getFullYear(), q*3, 1).toISOString().split('T')[0]);
            setTo(new Date(d.getFullYear(), q*3+3, 0).toISOString().split('T')[0]);
          }}>This Quarter</button>
        </div>
      </div>

      {report && (
        <>
          {/* GSTR-3B Summary */}
          <div className="card">
            <h3 style={{ marginBottom: 16, fontSize: 16 }}>📋 GSTR-3B Summary — {from} to {to}</h3>
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-label">Total Invoices</div>
                <div className="stat-value">{report.totalInvoices}</div>
              </div>
              <div className="stat-card green">
                <div className="stat-label">Taxable Value</div>
                <div className="stat-value" style={{ fontSize: 20 }}>{fmt(report.taxableValue)}</div>
              </div>
              <div className="stat-card blue">
                <div className="stat-label">Grand Total</div>
                <div className="stat-value" style={{ fontSize: 20 }}>{fmt(report.grandTotal)}</div>
              </div>
            </div>

            <table style={{ marginTop: 8 }}>
              <thead>
                <tr><th>Tax Type</th><th>Rate Details</th><th style={{ textAlign: 'right' }}>Amount</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>CGST (Central GST)</strong></td>
                  <td style={{ fontSize: 12, color: '#888' }}>Intrastate sales — Central portion</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#4f8ef7' }}>{fmt(report.cgst)}</td>
                </tr>
                <tr>
                  <td><strong>SGST (State GST)</strong></td>
                  <td style={{ fontSize: 12, color: '#888' }}>Intrastate sales — State portion (AP)</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#4f8ef7' }}>{fmt(report.sgst)}</td>
                </tr>
                <tr>
                  <td><strong>IGST (Integrated GST)</strong></td>
                  <td style={{ fontSize: 12, color: '#888' }}>Interstate sales — Full GST</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#4f8ef7' }}>{fmt(report.igst)}</td>
                </tr>
                <tr style={{ background: '#1a1a2e' }}>
                  <td style={{ color: '#fff', fontWeight: 700 }}>Total Tax Liability</td>
                  <td style={{ color: '#aab0cc', fontSize: 12 }}>CGST + SGST + IGST</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#4f8ef7', fontSize: 18 }}>{fmt(report.totalTax)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* HSN Summary (required for GSTR-1) */}
          {Object.keys(hsnSummary).length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: 16, fontSize: 16 }}>📦 HSN-wise Summary (GSTR-1 Table 12)</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>HSN Code</th><th>Description</th>
                      <th style={{ textAlign: 'right' }}>Taxable Value</th>
                      <th style={{ textAlign: 'right' }}>CGST</th>
                      <th style={{ textAlign: 'right' }}>SGST</th>
                      <th style={{ textAlign: 'right' }}>IGST</th>
                      <th style={{ textAlign: 'right' }}>Total Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(hsnSummary).map(h => (
                      <tr key={h.hsn}>
                        <td><span className="badge badge-gray">{h.hsn}</span></td>
                        <td>{h.name}</td>
                        <td style={{ textAlign: 'right' }}>₹{fmtN(h.taxable)}</td>
                        <td style={{ textAlign: 'right' }}>₹{fmtN(h.cgst)}</td>
                        <td style={{ textAlign: 'right' }}>₹{fmtN(h.sgst)}</td>
                        <td style={{ textAlign: 'right' }}>₹{fmtN(h.igst)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{fmtN(h.cgst + h.sgst + h.igst)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* B2B Invoice list (GSTR-1 Table 4) */}
          {invoices.filter(i => i.customer?.isGstRegistered).length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: 16, fontSize: 16 }}>🏢 B2B Sales (GSTR-1 Table 4 — GST Registered Buyers)</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Invoice No</th><th>Date</th><th>Buyer Name</th><th>Buyer GSTIN</th>
                      <th>Taxable</th><th>CGST</th><th>SGST</th><th>IGST</th><th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.filter(i => i.customer?.isGstRegistered).map(inv => (
                      <tr key={inv.id}>
                        <td><strong>{inv.invoiceNumber}</strong></td>
                        <td>{inv.invoiceDate}</td>
                        <td>{inv.customer?.name}</td>
                        <td>{inv.customer?.gstin}</td>
                        <td>₹{fmtN(inv.subtotal)}</td>
                        <td>₹{fmtN(inv.cgstAmount)}</td>
                        <td>₹{fmtN(inv.sgstAmount)}</td>
                        <td>₹{fmtN(inv.igstAmount)}</td>
                        <td><strong>₹{fmtN(inv.grandTotal)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {!report && (
        <div className="empty">
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <div>Select a date range and click Generate Report</div>
          <div style={{ fontSize: 13, color: '#aaa', marginTop: 8 }}>Data ready for GSTR-1 and GSTR-3B filing</div>
        </div>
      )}
    </div>
  );
}
