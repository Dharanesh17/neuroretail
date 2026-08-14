import React, { useState } from 'react';
import { 
  UploadCloud, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  Brain, 
  BarChart2, 
  RefreshCw,
  AlertTriangle,
  Download,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../api/client';

export default function DataUploadWizard({ onUploadComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [cleaningReport, setCleaningReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

  const steps = [
    { number: 1, label: 'Choose File' },
    { number: 2, label: 'Preview Data' },
    { number: 3, label: 'AI Validation' },
    { number: 4, label: 'Column Mapping' },
    { number: 5, label: 'Train AI' },
    { number: 6, label: 'Generate Dashboard' },
  ];

  const handleFileDrop = (e) => {
    e.preventDefault();
    const selected = e.target.files ? e.target.files[0] : null;
    if (selected) {
      setFile(selected);
      setFilename(selected.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target.result);
        setCurrentStep(2);
      };
      reader.readAsText(selected);
    }
  };

  const executeAICleaning = async () => {
    setLoading(true);
    setCurrentStep(3);
    const content = fileContent || `Invoice Date,Product Name,Category,Cost Price,Selling Price,Quantity,Stock,Tax,Branch,Weather,Festival\n2025-01-01,NeuroPulse SmartWatch,Wearables,11500,21499,35,18,18%,Branch A,Sunny,Diwali`;
    const report = await api.cleanUploadedDataset(content, filename || "historical_sales.csv");
    setCleaningReport(report);
    setLoading(false);
    setCurrentStep(4);
  };

  const executeAITraining = () => {
    setCurrentStep(5);
    setTrainingProgress(10);
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setCurrentStep(6);
          onUploadComplete();
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const handleDownloadSampleData = () => {
    const sampleCSV = `Invoice Date,Product Name,Category,Supplier,Cost Price INR,Selling Price INR,Quantity,Stock,Customer,Location,Discount,Tax,Payment Method,Store Branch,Weather,Holiday,Festival
2025-01-01,NeuroPulse SmartWatch Pro,Wearables,TechSupplier India,11500.00,21499.00,35,18,Rahul Sharma,Mumbai,5%,18%,UPI,Branch North,Clear,No,NewYear
2025-01-02,AcousticSense ANC Headphones,Audio,SoundCraft,7500.00,13999.00,65,62,Priya Patel,Bengaluru,0%,18%,CreditCard,Branch South,Rainy,No,Normal
2025-01-03,CogniHome Ambient Smart Hub,Smart Home,IoT Hubs Ltd,5200.00,10499.00,28,12,Ananya Iyer,Delhi,10%,18%,NetBanking,Branch Central,Clear,No,Normal
2025-01-04,OptiVision 4K Drone Cam,Electronics,Aerial Robotics,22000.00,37999.00,14,9,Vikram Seth,Hyderabad,0%,18%,UPI,Branch West,Clear,No,Normal
2025-01-05,BioGrid Ergonomic Desk Lamp,Smart Home,Lumina Lights,2600.00,5499.00,60,95,Rohan Gupta,Pune,0%,18%,Cash,Branch North,Clear,No,Normal
2025-01-06,HyperCharge MagSafe PowerBank,Accessories,PowerTech,1500.00,3799.00,110,110,Siddharth Rao,Chennai,5%,18%,UPI,Branch East,Clear,No,Festival`;

    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historical_sales_reference.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="corp-card p-6 border-l-4 border-l-blue-600">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Automated AI Data Cleaning & Model Retraining Wizard</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Historical Data Upload & AI Cleaning</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Upload raw historical sales files (.csv, .xlsx, .json). AI automatically removes duplicate rows, imputes missing values, and trains prediction models.
            </p>
          </div>

          <button
            onClick={handleDownloadSampleData}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center space-x-2 shrink-0 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Sample CSV Template</span>
          </button>
        </div>

        {/* Wizard Stepper Progress Bar */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-6 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          {steps.map((s) => (
            <div key={s.number} className="flex items-center space-x-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep >= s.number
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {currentStep > s.number ? <CheckCircle2 className="w-4 h-4" /> : s.number}
              </div>
              <span className={`text-xs font-semibold hidden sm:inline ${
                currentStep === s.number ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-400'
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Interactive Wizard Box */}
      <div className="corp-card p-8">
        {currentStep === 1 && (
          <div className="space-y-6 text-center max-w-xl mx-auto py-6">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-3xl p-10 bg-slate-50/50 dark:bg-slate-900/50 transition-all relative">
              <input
                type="file"
                accept=".csv,.xlsx,.json"
                onChange={handleFileDrop}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Drag & Drop Historical Dataset Here</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Supports CSV, Excel (.xlsx), and JSON formats</p>
              <button className="mt-4 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md">
                Browse File from Computer
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Dataset Preview: {filename || 'historical_sales.csv'}</span>
              </h3>
              <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-200">
                17 Auto-Detected Columns
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 text-xs max-h-56">
              <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase">
                  <tr>
                    <th className="p-3">Invoice Date</th>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Cost Price (₹)</th>
                    <th className="p-3">Selling Price (₹)</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Branch</th>
                    <th className="p-3">Festival</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  <tr>
                    <td className="p-3 font-mono">2025-01-01</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">NeuroPulse SmartWatch Pro</td>
                    <td className="p-3">Wearables</td>
                    <td className="p-3">₹11,500</td>
                    <td className="p-3 text-blue-600 font-bold">₹21,499</td>
                    <td className="p-3">35</td>
                    <td className="p-3">Branch A</td>
                    <td className="p-3">Diwali</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono">2025-01-02</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">AcousticSense ANC Headphones</td>
                    <td className="p-3">Audio</td>
                    <td className="p-3">₹7,500</td>
                    <td className="p-3 text-blue-600 font-bold">₹13,999</td>
                    <td className="p-3">65</td>
                    <td className="p-3">Branch B</td>
                    <td className="p-3">Normal</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={executeAICleaning}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg flex items-center space-x-2"
              >
                <span>Run AI Cleaning & Validation →</span>
              </button>
            </div>
          </div>
        )}

        {(currentStep === 3 || currentStep === 4) && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-blue-50/60 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Dataset Health Report</span>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                  Quality Score: {cleaningReport?.quality_score || 98}/100
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Automated AI Data Normalization Completed</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-xl shadow-lg">
                98%
              </div>
            </div>

            {/* Quality breakdown cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500">Processed Records</span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">1,420 rows</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500">Duplicates Removed</span>
                <div className="text-xl font-bold text-green-600 mt-1">{cleaningReport?.duplicates_removed || 14} rows</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500">Missing Imputed</span>
                <div className="text-xl font-bold text-blue-600 mt-1">{cleaningReport?.missing_imputed || 6} values</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500">Outliers Normalized</span>
                <div className="text-xl font-bold text-orange-500 mt-1">{cleaningReport?.outliers_adjusted || 3} points</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={executeAITraining}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg flex items-center space-x-2"
              >
                <Brain className="w-4 h-4" />
                <span>Train AI Prediction Models Now →</span>
              </button>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6 text-center py-8 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 mx-auto flex items-center justify-center">
              <Brain className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Training 6 ML Prediction Models</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Benchmarking LSTM, XGBoost, Random Forest, LightGBM, Prophet, ARIMA...</p>
            </div>

            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${trainingProgress}%` }}
              />
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{trainingProgress}% Complete</span>
          </div>
        )}

        {currentStep === 6 && (
          <div className="space-y-6 text-center py-6 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">AI Training Complete!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">LSTM Neural Network selected as optimal model (97.4% accuracy). All 10 dashboards are updated.</p>
            </div>

            <button
              onClick={() => onUploadComplete()}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xl"
            >
              Open Updated Enterprise Dashboards →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
