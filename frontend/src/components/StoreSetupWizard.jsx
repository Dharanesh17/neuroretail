import React, { useState } from 'react';
import { Store, X, CheckCircle2, Building, DollarSign, Globe, Layers } from 'lucide-react';

export default function StoreSetupWizard({ isOpen, onClose, onCreateStore }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [storeType, setStoreType] = useState('Supermarket & Grocery');
  const [category, setCategory] = useState('Retail Grocery');
  const [gstin, setGstin] = useState('');
  const [currency, setCurrency] = useState('INR (₹)');
  const [country, setCountry] = useState('India');
  const [branches, setBranches] = useState(2);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateStore({
      name: name || "My New Enterprise Store",
      type: storeType,
      category,
      gstin: gstin || "27NEWST1234A1Z9",
      currency,
      country,
      branches
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Store Setup Wizard</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Step {step} of 2 - Store Profile & Configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 ? (
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Store Name</label>
              <input
                type="text"
                placeholder="e.g. Fresh Mart Hypermarket"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Store Type</label>
                <select
                  value={storeType}
                  onChange={(e) => setStoreType(e.target.value)}
                  className="w-full mt-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                >
                  <option value="Supermarket & Grocery">Supermarket & Grocery</option>
                  <option value="Apparel & Fashion">Apparel & Fashion</option>
                  <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                  <option value="Pharmacy & Healthcare">Pharmacy & Healthcare</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Primary Category</label>
                <input
                  type="text"
                  placeholder="e.g. Retail Consumer Goods"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-md transition-all mt-4"
            >
              Continue to Step 2 →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">GSTIN Tax Registration</label>
                <input
                  type="text"
                  placeholder="27AAAAA0000A1Z5"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full mt-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full mt-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                >
                  <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                  <option value="USD ($)">USD ($) - US Dollar</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full mt-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Number of Store Branches</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={branches}
                  onChange={(e) => setBranches(parseInt(e.target.value) || 1)}
                  className="w-full mt-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="w-2/3 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-lg"
              >
                Finish & Create Store Environment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
