'use client';
import { useState } from 'react';

const fmtINR = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });

const printStyles = `
@media print {
  body > * { display: none !important; }
  #invoice-print-wrapper { display: block !important; }
  #invoice-print-wrapper * { visibility: visible; }
  @page { margin: 0.5in; size: A4; }
}
#invoice-print-wrapper { display: none; }
`;

const inputCls = 'border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 text-sm';
const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';

function Field({ label, value, onChange, type = 'text', placeholder, multiline }) {
  return (
    <div className="mb-3">
      <label className={labelCls}>{label}</label>
      {multiline ? (
        <textarea rows={2} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className={inputCls + ' resize-none'} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className={inputCls} />
      )}
    </div>
  );
}

export default function InvoiceGenerator() {
  const [tab, setTab] = useState('form');
  const [seller, setSeller] = useState({ name: '', address: '', gstin: '', phone: '', email: '' });
  const [buyer, setBuyer] = useState({ name: '', address: '', gstin: '', phone: '' });
  const [items, setItems] = useState([{ desc: '', qty: 1, rate: '' }]);
  const [invoiceNo, setInvoiceNo] = useState('INV-001');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [gstRate, setGstRate] = useState(18);
  const [txType, setTxType] = useState('intra');

  const sf = k => v => setSeller(s => ({ ...s, [k]: v }));
  const bf = k => v => setBuyer(b => ({ ...b, [k]: v }));

  const updateItem = (i, k, v) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [k]: v } : item));
  };
  const addItem = () => setItems(prev => [...prev, { desc: '', qty: 1, rate: '' }]);
  const removeItem = i => setItems(prev => prev.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((s, it) => s + (parseFloat(it.qty) || 0) * (parseFloat(it.rate) || 0), 0);
  const gstAmt = subtotal * gstRate / 100;
  const total = subtotal + gstAmt;

  const copyText = () => {
    const lines = [
      `TAX INVOICE`, `Invoice No: ${invoiceNo}  Date: ${invoiceDate}`, ``,
      `From: ${seller.name} | GSTIN: ${seller.gstin}`,
      `${seller.address}`,
      ``,
      `To: ${buyer.name} | GSTIN: ${buyer.gstin || 'N/A'}`,
      `${buyer.address}`,
      ``,
      `Items:`,
      ...items.map((it, i) => `  ${i+1}. ${it.desc} — Qty: ${it.qty} × ₹${it.rate} = ${fmtINR((parseFloat(it.qty)||0)*(parseFloat(it.rate)||0))}`),
      ``,
      `Subtotal: ${fmtINR(subtotal)}`,
      txType === 'intra' ? `CGST (${gstRate/2}%): ${fmtINR(gstAmt/2)}\nSGST (${gstRate/2}%): ${fmtINR(gstAmt/2)}` : `IGST (${gstRate}%): ${fmtINR(gstAmt)}`,
      `Grand Total: ${fmtINR(total)}`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
  };

  return (
    <div className="space-y-5">
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      {/* Tabs */}
      <div className="flex gap-2">
        {['form', 'preview'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
            {t === 'form' ? '📝 Fill Details' : '👁️ Preview & Download'}
          </button>
        ))}
      </div>

      {tab === 'form' && (
        <div className="space-y-4">
          {/* Seller */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Your Business (Seller)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Field label="Business Name *" value={seller.name} onChange={sf('name')} placeholder="ABC Enterprises" />
              <Field label="GSTIN" value={seller.gstin} onChange={sf('gstin')} placeholder="22AAAAA0000A1Z5" />
              <Field label="Phone" value={seller.phone} onChange={sf('phone')} placeholder="+91 98765 43210" />
              <Field label="Email" value={seller.email} onChange={sf('email')} placeholder="billing@abc.com" type="email" />
              <div className="sm:col-span-2">
                <Field label="Address" value={seller.address} onChange={sf('address')} placeholder="123 MG Road, Mumbai 400001" multiline />
              </div>
            </div>
          </div>

          {/* Buyer */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Bill To (Buyer)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Field label="Name / Business *" value={buyer.name} onChange={bf('name')} placeholder="XYZ Ltd." />
              <Field label="GSTIN (optional)" value={buyer.gstin} onChange={bf('gstin')} placeholder="27BBBBB0000B1Z3" />
              <Field label="Phone" value={buyer.phone} onChange={bf('phone')} placeholder="+91 99999 00000" />
              <div />
              <div className="sm:col-span-2">
                <Field label="Address" value={buyer.address} onChange={bf('address')} placeholder="456 Nehru Nagar, Delhi 110001" multiline />
              </div>
            </div>
          </div>

          {/* Invoice meta */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Field label="Invoice No" value={invoiceNo} onChange={setInvoiceNo} placeholder="INV-001" />
              <Field label="Invoice Date" value={invoiceDate} onChange={setInvoiceDate} type="date" />
            </div>
            <div className="mb-4">
              <label className={labelCls}>GST Rate</label>
              <div className="flex gap-2">
                {[5, 12, 18, 28].map(r => (
                  <button key={r} onClick={() => setGstRate(r)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${gstRate === r ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'}`}>
                    {r}%
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Transaction Type</label>
              <div className="flex gap-2">
                {[['intra', 'Intra-state (CGST+SGST)'], ['inter', 'Inter-state (IGST)']].map(([v, l]) => (
                  <button key={v} onClick={() => setTxType(v)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${txType === v ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Items / Services</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 text-slate-500 font-medium w-8">#</th>
                    <th className="text-left py-2 text-slate-500 font-medium">Description</th>
                    <th className="text-right py-2 text-slate-500 font-medium w-16">Qty</th>
                    <th className="text-right py-2 text-slate-500 font-medium w-24">Rate (₹)</th>
                    <th className="text-right py-2 text-slate-500 font-medium w-24">Amount</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => {
                    const amt = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
                    return (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="py-2 text-slate-400">{i + 1}</td>
                        <td className="py-1.5 pr-2">
                          <input value={item.desc} onChange={e => updateItem(i, 'desc', e.target.value)}
                            placeholder="Service / product description" className={inputCls + ' text-xs'} />
                        </td>
                        <td className="py-1.5 px-1">
                          <input type="number" min="1" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)}
                            className={inputCls + ' text-right text-xs'} />
                        </td>
                        <td className="py-1.5 px-1">
                          <input type="number" min="0" value={item.rate} onChange={e => updateItem(i, 'rate', e.target.value)}
                            placeholder="0" className={inputCls + ' text-right text-xs'} />
                        </td>
                        <td className="py-1.5 text-right font-medium text-slate-800">{fmtINR(amt)}</td>
                        <td className="py-1.5 text-center">
                          {items.length > 1 && (
                            <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button onClick={addItem} className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium">+ Add Item</button>

            {/* Totals */}
            <div className="mt-4 border-t border-slate-100 pt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="font-medium">{fmtINR(subtotal)}</span></div>
              {txType === 'intra' ? (
                <>
                  <div className="flex justify-between text-slate-600"><span>CGST ({gstRate / 2}%)</span><span>{fmtINR(gstAmt / 2)}</span></div>
                  <div className="flex justify-between text-slate-600"><span>SGST ({gstRate / 2}%)</span><span>{fmtINR(gstAmt / 2)}</span></div>
                </>
              ) : (
                <div className="flex justify-between text-slate-600"><span>IGST ({gstRate}%)</span><span>{fmtINR(gstAmt)}</span></div>
              )}
              <div className="flex justify-between text-slate-900 font-bold text-base border-t border-slate-200 pt-2 mt-1">
                <span>Grand Total</span><span className="text-indigo-700">{fmtINR(total)}</span>
              </div>
            </div>
          </div>

          <button onClick={() => setTab('preview')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-medium transition-colors w-full">
            Preview Invoice →
          </button>
        </div>
      )}

      {tab === 'preview' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <button onClick={() => window.print()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 font-medium transition-colors flex items-center gap-2">
              🖨️ Download as PDF
            </button>
            <button onClick={copyText}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-5 py-2.5 font-medium transition-colors">
              📋 Copy as Text
            </button>
          </div>

          {/* Print wrapper — visible on screen as preview, full page when printing */}
          <div id="invoice-print-wrapper" style={{ display: 'block' }}>
            <div id="invoice-print" style={{ background: '#fff', padding: '32px', maxWidth: '720px', margin: '0 auto', fontFamily: 'Georgia, serif', fontSize: '13px', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #4f46e5', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: '#4f46e5', letterSpacing: '-0.5px' }}>TAX INVOICE</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Original for Recipient</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '600' }}>Invoice #{invoiceNo}</div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>{new Date(invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                </div>
              </div>

              {/* Seller / Buyer */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#6366f1', fontWeight: '700', marginBottom: '6px' }}>From</div>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>{seller.name || '—'}</div>
                  {seller.address && <div style={{ color: '#475569', marginTop: '3px', lineHeight: '1.5' }}>{seller.address}</div>}
                  {seller.gstin && <div style={{ marginTop: '4px' }}><strong>GSTIN:</strong> {seller.gstin}</div>}
                  {seller.phone && <div>Ph: {seller.phone}</div>}
                  {seller.email && <div>{seller.email}</div>}
                </div>
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#6366f1', fontWeight: '700', marginBottom: '6px' }}>Bill To</div>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>{buyer.name || '—'}</div>
                  {buyer.address && <div style={{ color: '#475569', marginTop: '3px', lineHeight: '1.5' }}>{buyer.address}</div>}
                  {buyer.gstin && <div style={{ marginTop: '4px' }}><strong>GSTIN:</strong> {buyer.gstin}</div>}
                  {buyer.phone && <div>Ph: {buyer.phone}</div>}
                </div>
              </div>

              {/* Items table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    {['#', 'Description', 'Qty', 'Rate', 'Amount'].map((h, i) => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: i >= 2 ? 'right' : 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', border: '1px solid #e2e8f0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => {
                    const amt = (parseFloat(it.qty) || 0) * (parseFloat(it.rate) || 0);
                    return (
                      <tr key={i}>
                        <td style={{ padding: '8px 10px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>{i + 1}</td>
                        <td style={{ padding: '8px 10px', border: '1px solid #e2e8f0' }}>{it.desc || '—'}</td>
                        <td style={{ padding: '8px 10px', border: '1px solid #e2e8f0', textAlign: 'right' }}>{it.qty}</td>
                        <td style={{ padding: '8px 10px', border: '1px solid #e2e8f0', textAlign: 'right' }}>₹{it.rate || 0}</td>
                        <td style={{ padding: '8px 10px', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: '500' }}>{fmtINR(amt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <table style={{ minWidth: '240px' }}>
                  <tbody>
                    <tr><td style={{ padding: '4px 8px', color: '#64748b' }}>Subtotal</td><td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmtINR(subtotal)}</td></tr>
                    {txType === 'intra' ? (
                      <>
                        <tr><td style={{ padding: '4px 8px', color: '#64748b' }}>CGST ({gstRate / 2}%)</td><td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmtINR(gstAmt / 2)}</td></tr>
                        <tr><td style={{ padding: '4px 8px', color: '#64748b' }}>SGST ({gstRate / 2}%)</td><td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmtINR(gstAmt / 2)}</td></tr>
                      </>
                    ) : (
                      <tr><td style={{ padding: '4px 8px', color: '#64748b' }}>IGST ({gstRate}%)</td><td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmtINR(gstAmt)}</td></tr>
                    )}
                    <tr style={{ borderTop: '2px solid #4f46e5' }}>
                      <td style={{ padding: '8px', fontWeight: '700', fontSize: '15px' }}>Grand Total</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: '700', fontSize: '15px', color: '#4f46e5' }}>{fmtINR(total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '24px', padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '11px', color: '#64748b' }}>
                This is a computer-generated invoice and does not require a physical signature.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
