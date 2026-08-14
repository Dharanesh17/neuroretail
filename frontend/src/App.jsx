import React, { useEffect, useState } from 'react';
import { Bot, MessageSquareText } from 'lucide-react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DataUploadModule from './components/DataUploadModule';
import DynamicPricing from './components/DynamicPricing';
import DemandForecast from './components/DemandForecast';
import InventoryIntelligence from './components/InventoryIntelligence';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import RealtimeAlerts from './components/RealtimeAlerts';
import {
  AlertsCenter, AuditLog, CompetitorAnalysis, DataQualityMonitor, ExecutiveDashboard,
  ModelPerformanceCenter, ProductManagement, RecommendationCenter, ReportsCenter,
  ScenarioSimulator, SettingsView, UsersRoles
} from './components/EnterpriseViews';
import { api } from './api/client';

const titles = {
  overview: 'Executive Dashboard', upload: 'Data Upload', forecast: 'Demand Forecast', pricing: 'Dynamic Pricing',
  inventory: 'Inventory Optimization', recommendations: 'AI Recommendations', scenario: 'What-if Simulator',
  competitors: 'Competitor Analysis', models: 'Model Performance', quality: 'Data Quality', products: 'Products',
  alerts: 'Alerts', reports: 'Reports & Export', audit: 'Audit Logs', users: 'Users & Roles', settings: 'Settings',
  assistant: 'NeuroRetail Assistant'
};

function AssistantLanding({ onOpen }) {
  return <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white"><Bot className="h-6 w-6" /></div><p className="mt-5 text-xs font-black uppercase tracking-[0.15em] text-blue-700">Optional AI assistant</p><h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">Ask about the dashboard or a recommendation</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">The assistant is intentionally a supporting feature: it explains the business data and recommended actions, while the dashboard remains the primary decision workspace.</p><button type="button" onClick={onOpen} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"><MessageSquareText className="h-4 w-4" />Open assistant</button></section>;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [aiMetrics, setAiMetrics] = useState({ accuracy: 96.8, mae: 0.85, retrain_count: 13 });
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const loadData = async () => {
    try {
      const [dashboard, productData, alertData] = await Promise.all([api.getExecutiveDashboard(), api.getProducts(), api.getOperationalAlerts()]);
      setSummary(dashboard);
      setProducts(productData || []);
      setAlerts(alertData?.alerts || dashboard?.recent_alerts || []);
      setAiMetrics({ accuracy: dashboard?.forecast_accuracy || dashboard?.ai_accuracy || 96.8, mae: 0.85, retrain_count: 13 });
    } catch (error) {
      console.error('Error loading NeuroRetail data:', error);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerRetrain = async () => {
    const result = await api.retrainAI();
    if (result?.metrics) setAiMetrics(result.metrics);
    await loadData();
    return result;
  };

  const renderPage = () => {
    const pageProps = { products, onNavigate: setActiveTab };
    switch (activeTab) {
      case 'overview': return <ExecutiveDashboard summary={summary} onNavigate={setActiveTab} />;
      case 'upload': return <DataUploadModule onDataCalibrated={loadData} />;
      case 'forecast': return <DemandForecast products={products} />;
      case 'pricing': return <DynamicPricing products={products} onPriceUpdated={loadData} />;
      case 'inventory': return <InventoryIntelligence products={products} onReorderSuccess={loadData} />;
      case 'recommendations': return <RecommendationCenter onChanged={loadData} />;
      case 'scenario': return <ScenarioSimulator products={products} />;
      case 'competitors': return <CompetitorAnalysis />;
      case 'models': return <ModelPerformanceCenter />;
      case 'quality': return <DataQualityMonitor onNavigate={setActiveTab} />;
      case 'products': return <ProductManagement {...pageProps} />;
      case 'alerts': return <AlertsCenter />;
      case 'reports': return <ReportsCenter />;
      case 'audit': return <AuditLog />;
      case 'users': return <UsersRoles />;
      case 'settings': return <SettingsView />;
      case 'assistant': return <AssistantLanding onOpen={() => setVoiceOpen(true)} />;
      default: return <ExecutiveDashboard summary={summary} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white dark:bg-slate-950 dark:text-slate-100">
      <Navbar onOpenVoice={() => setVoiceOpen(true)} onTriggerRetrain={handleTriggerRetrain} aiMetrics={aiMetrics} alertCount={alerts.length} onOpenAlerts={() => setAlertsOpen(true)} />
      <div className="flex min-h-[calc(100vh-65px)] flex-col lg:flex-row">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="min-w-0 flex-1 overflow-y-auto"><div className="mx-auto w-full max-w-[1600px] space-y-5 p-4 sm:p-5 lg:p-6"><div className="flex items-center gap-2 text-xs font-bold text-slate-400"><span>NeuroRetail</span><span>/</span><span className="text-slate-700 dark:text-slate-200">{titles[activeTab]}</span></div>{renderPage()}</div></main>
      </div>
      <VoiceAssistantModal isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} summary={summary} products={products} onNavigate={(tab) => { setActiveTab(tab === 'reference' ? 'upload' : tab); setVoiceOpen(false); }} onTriggerRetrain={handleTriggerRetrain} />
      <RealtimeAlerts isOpen={alertsOpen} onClose={() => setAlertsOpen(false)} alerts={alerts} />
    </div>
  );
}
