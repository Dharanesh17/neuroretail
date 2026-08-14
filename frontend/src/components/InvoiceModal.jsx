import React, { useState } from 'react';
import { FileText, Download, CheckCircle2, Printer, Building } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function InvoiceModal({ products }) {
  const [selectedProdId, setSelectedProdId] = useState(products[0]?.id || 'PROD-101');
  const [quantity, setQuantity] = useState(2);
  const [customerName, setCustomerName] = useState('Rahul Sharma');
  const [customerEmail, setCustomerEmail] = useState('rahul.sharma@example.in');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const selectedProduct = products.find(p => p.id === selectedProdId) || products[0];

  const unitPrice = selectedProduct?.current_price || 19999.00;
  const subtotal = unitPrice * quantity;
  const aiDiscount = Math.round(subtotal * 0.05 * 100) / 100; // 5% AI Loyalty Discount
  const gstTax = Math.round((subtotal - aiDiscount) * 0.18 * 100) / 100; // 18% GST in India
  const grandTotal = Math.round((subtotal - aiDiscount + gstTax) * 100) / 100;

  const invoiceNumber = `INV-IN-${Math.floor(10000 + Math.random() * 90000)}`;
  const dateStr = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(val || 0);
  };

  const handleGeneratePDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(99, 102, 241);
      doc.text("NeuroRetail Cognitive Systems (India)", 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("AI Dynamic Pricing & Retail Intelligence Platform", 14, 28);
      doc.text("GSTIN: 27AAAAA0000A1Z5 | Official Tax Invoice", 14, 34);

      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 38, 196, 38);

      // Invoice info
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Tax Invoice No: ${invoiceNumber}`, 14, 48);
      doc.text(`Date: ${dateStr}`, 135, 48);

      // Customer info
      doc.setFontSize(11);
      doc.text("Billed To:", 14, 60);
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Name: ${customerName}`, 14, 66);
      doc.text(`Email: ${customerEmail}`, 14, 72);

      // Table Header
      doc.setFillColor(240, 240, 250);
      doc.rect(14, 82, 182, 8, 'F');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("Item / Description", 16, 87);
      doc.text("Qty", 115, 87);
      doc.text("Unit Price (INR)", 135, 87);
      doc.text("Total (INR)", 170, 87);

      // Table Item
      doc.text(`${selectedProduct.name} (${selectedProduct.id})`, 16, 98);
      doc.text(`${quantity}`, 117, 98);
      doc.text(`Rs. ${formatINR(unitPrice)}`, 135, 98);
      doc.text(`Rs. ${formatINR(subtotal)}`, 170, 98);

      doc.line(14, 106, 196, 106);

      // Summary
      doc.text(`Subtotal:`, 125, 116);
      doc.text(`Rs. ${formatINR(subtotal)}`, 170, 116);

      doc.text(`AI Loyalty Discount (5%):`, 125, 123);
      doc.text(`-Rs. ${formatINR(aiDiscount)}`, 170, 123);

      doc.text(`GST (18%):`, 125, 130);
      doc.text(`Rs. ${formatINR(gstTax)}`, 170, 130);

      doc.setFontSize(12);
      doc.setTextColor(99, 102, 241);
      doc.text(`Grand Total:`, 125, 140);
      doc.text(`Rs. ${formatINR(grandTotal)}`, 170, 140);

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text("Thank you for shopping with NeuroRetail India. Dynamically priced by Cognitive AI Engine.", 14, 160);

      doc.save(`${invoiceNumber}_${selectedProduct.id}.pdf`);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (e) {
      console.error("Error generating PDF invoice:", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-extrabold uppercase tracking-wider mb-1">
          <FileText className="w-4 h-4" />
          <span>GST Billing & PDF Engine (INR Standard)</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white">Tax Invoice & Order Receipt Generator</h2>
        <p className="text-slate-300 text-sm mt-1">
          Generates itemized PDF GST tax invoices featuring AI discount breakdowns and Indian GST (18%) calculations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Inputs */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Order Options</h3>

          <div>
            <label className="text-xs font-semibold text-slate-400">Select Item</label>
            <select
              value={selectedProdId}
              onChange={(e) => setSelectedProdId(e.target.value)}
              className="w-full mt-1 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (₹{formatINR(p.current_price)})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Quantity</label>
            <input
              type="number"
              min="1"
              max="20"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full mt-1 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full mt-1 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Customer Email</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full mt-1 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none"
            />
          </div>

          <button
            onClick={handleGeneratePDF}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Generate & Download GST Invoice (PDF)</span>
          </button>

          {downloadSuccess && (
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold justify-center">
              <CheckCircle2 className="w-4 h-4" />
              <span>PDF downloaded successfully!</span>
            </div>
          )}
        </div>

        {/* Invoice Preview */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-white">Tax Invoice Preview</h3>
              <p className="text-xs text-slate-400">GSTIN: 27AAAAA0000A1Z5 • No: {invoiceNumber}</p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PAID & VERIFIED
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold">Billed To:</span>
              <span className="text-white font-bold">{customerName}</span>
              <div className="text-slate-400">{customerEmail}</div>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block font-semibold">Issued By:</span>
              <span className="text-indigo-400 font-bold">NeuroRetail India Pvt Ltd</span>
              <div className="text-slate-400">HQ Retail Operations, Bengaluru</div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-900/80 p-3 grid grid-cols-4 font-bold text-slate-400 border-b border-slate-800">
              <div>Item Description</div>
              <div className="text-center">Qty</div>
              <div className="text-right">Unit Price</div>
              <div className="text-right">Total</div>
            </div>
            <div className="p-3 grid grid-cols-4 text-slate-200 font-medium">
              <div>{selectedProduct.name}</div>
              <div className="text-center">{quantity}</div>
              <div className="text-right">₹{formatINR(unitPrice)}</div>
              <div className="text-right">₹{formatINR(subtotal)}</div>
            </div>
          </div>

          {/* Calculations Breakdown */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="text-white font-bold">₹{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>AI Loyalty Incentive Discount (5%):</span>
              <span className="font-bold">-₹{formatINR(aiDiscount)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>GST (18%):</span>
              <span className="text-white font-bold">₹{formatINR(gstTax)}</span>
            </div>
            <div className="flex justify-between text-base text-white font-extrabold border-t border-slate-800 pt-2">
              <span>Grand Total:</span>
              <span className="text-cyan-400">₹{formatINR(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
