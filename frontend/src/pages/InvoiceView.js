// src/pages/InvoiceView.js
import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getInvoice } from '../api';

const fmt  = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
const fmtN = (n) => Number(n || 0).toFixed(2);

export default function InvoiceView() {
  const { id } = useParams();
  const printRef = useRef();
  const [inv, setInv] = useState(null);

  useEffect(() => { getInvoice(id).then(r => setInv(r.data)); }, [id]);

  const handlePrint = () => window.print();

  if (!inv) return <div className="loader">Loading invoice...</div>;

  const isInterstate = inv.supplyType === 'INTERSTATE';

  return (
    <div>
      {/* Action bar — hidden on print */}
      <div className="no-print" style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <Link to="/invoices" className="btn btn-outline">← Back</Link>
        <button className="btn btn-primary" onClick={handlePrint}>🖨️ Print / Save PDF</button>
        <Link to="/invoice/new" className="btn btn-success">➕ New Bill</Link>
      </div>

      {/* Printable Invoice */}
      <div ref={printRef} className="invoice-print card">
        {/* Header */}
        <div className="invoice-header">
          <div>
            <div className="invoice-title">TAX INVOICE</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Original for Buyer</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Your Business Name</div>
            <div style={{ fontSize: 13, color: '#555' }}>Wholesale Trader — Sugar, Atta, Oil, Rice</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>GSTIN: {inv.sellerGstin}</div>
            <div style={{ fontSize: 12, color: '#888' }}>Mangalagiri, Andhra Pradesh — 522503</div>
          </div>
        </div>

        {/* Invoice meta */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={{ background: '#f5f7fa', borderRadius: 8, padding: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>Bill To:</div>
            <div style={{ fontWeight: 600 }}>{inv.customer?.name}</div>
            {inv.customer?.gstin && <div style={{ fontSize: 13 }}>GSTIN: {inv.customer.gstin}</div>}
            <div style={{ fontSize: 13, color: '#666' }}>{inv.customer?.address}</div>
            <div style={{ fontSize: 13, color: '#666' }}>{inv.customer?.state} — {inv.customer?.stateCode}</div>
            <div style={{ fontSize: 13 }}>{inv.customer?.phone}</div>
          </div>
          <div style={{ background: '#f5f7fa', borderRadius: 8, padding: 14 }}>
            <Row label="Invoice No"   value={<strong>{inv.invoiceNumber}</strong>} />
            <Row label="Date"         value={inv.invoiceDate} />
            <Row label="Supply Type"  value={<span className={`badge ${isInterstate ? 'badge-amber' : 'badge-green'}`}>{inv.supplyType}</span>} />
            <Row label="Payment"      value={<span className={`badge ${inv.paymentStatus === 'PAID' ? 'badge-green' : 'badge-amber'}`}>{inv.paymentStatus}</span>} />
          </div>
        </div>

        {/* Items table */}
        <div className="table-wrap" style={{ marginBottom: 16 }}>
          <table className="tax-table">
            <thead>
              <tr>
                <th>#</th><th>Item</th><th>HSN</th><th>Qty</th><th>Unit</th>
                <th>Rate</th><th>Taxable Value</th>
                {isInterstate
                  ? <th>IGST</th>
                  : <><th>CGST</th><th>SGST</th></>}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {inv.items?.map((item, i) => (
                <tr key={item.id}>
                  <td>{i + 1}</td>
                  <td><strong>{item.productName}</strong></td>
                  <td>{item.hsnCode}</td>
                  <td>{fmtN(item.quantity)}</td>
                  <td>{item.unit}</td>
                  <td>₹{fmtN(item.rate)}</td>
                  <td>₹{fmtN(item.taxableValue)}</td>
                  {isInterstate
                    ? <td>₹{fmtN(item.igstAmount)} ({fmtN(item.igstRate)}%)</td>
                    : <>
                        <td>₹{fmtN(item.cgstAmount)} ({fmtN(item.cgstRate)}%)</td>
                        <td>₹{fmtN(item.sgstAmount)} ({fmtN(item.sgstRate)}%)</td>
                      </>}
                  <td><strong>₹{fmtN(item.totalAmount)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <table style={{ minWidth: 320 }}>
            <tbody>
              <tr className="tax-row"><td>Taxable Value</td><td style={{ textAlign: 'right' }}>{fmt(inv.subtotal)}</td></tr>
              {isInterstate
                ? <tr><td>IGST</td><td style={{ textAlign: 'right' }}>{fmt(inv.igstAmount)}</td></tr>
                : <>
                    <tr><td>CGST</td><td style={{ textAlign: 'right' }}>{fmt(inv.cgstAmount)}</td></tr>
                    <tr><td>SGST</td><td style={{ textAlign: 'right' }}>{fmt(inv.sgstAmount)}</td></tr>
                  </>}
              <tr><td>Total Tax</td><td style={{ textAlign: 'right' }}>{fmt(inv.totalTax)}</td></tr>
              <tr className="total-row">
                <td style={{ padding: '10px 14px' }}>GRAND TOTAL</td>
                <td style={{ textAlign: 'right', padding: '10px 14px', fontSize: 18 }}>{fmt(inv.grandTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notes */}
        {inv.notes && (
          <div style={{ marginTop: 20, padding: 12, background: '#f5f7fa', borderRadius: 8, fontSize: 13 }}>
            <strong>Notes:</strong> {inv.notes}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', borderTop: '1px solid #eee', paddingTop: 12 }}>
          <div>This is a computer-generated invoice.</div>
          <div>Authorised Signatory</div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
      <span style={{ color: '#666' }}>{label}:</span>
      <span>{value}</span>
    </div>
  );
}
