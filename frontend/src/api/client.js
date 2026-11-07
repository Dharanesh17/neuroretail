const BASE_URL = '/api';

// ---------------------------------------------------------------------------
// Auth token helpers — token is kept in sessionStorage (not localStorage)
// so it is cleared automatically when the browser tab closes.
// ---------------------------------------------------------------------------
function getToken() {
  return sessionStorage.getItem('neuroretail_auth_token') || '';
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra
  };
}

// All API calls go through apiFetch so the Bearer token is always attached.
async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: authHeaders(options.headers || {})
  });
  return res;
}

export const api = {
  async getStores() {
    try {
      const res = await apiFetch('/stores');
      if (res.ok) return await res.json();
    } catch (e) { }
    return { stores: [], active_store: null, user_role: 'Admin' };
  },

  async switchStore(storeId) {
    try {
      const res = await apiFetch('/store/switch', {
        method: 'POST',
        body: JSON.stringify({ store_id: storeId })
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    return { success: true };
  },

  async createStore(storeData) {
    try {
      const res = await apiFetch('/store/create', {
        method: 'POST',
        body: JSON.stringify(storeData)
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    return { success: true, store: { id: 'STORE-99', name: storeData.name } };
  },

  async cleanUploadedDataset(content, filename) {
    try {
      const res = await apiFetch('/upload/clean', {
        method: 'POST',
        body: JSON.stringify({ content, filename })
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    return { quality_score: 0, total_rows_processed: 0, status: 'Error — could not reach server' };
  },

  async getReferenceStatus() {
    try {
      const [summary, products] = await Promise.all([this.getSummary(), this.getProducts()]);
      return {
        records_count: summary?.data_cleaning_logs?.total_rows_processed || 0,
        sample_records: (products || []).slice(0, 5).map((product) => ({
          Date: new Date().toISOString().split('T')[0],
          Product_ID: product.id,
          Product_Name: product.name,
          Category: product.category,
          Units_Sold: Math.max(0, Math.round((product.demand_score || 0) / 2)),
          Price_Charged_INR: product.current_price,
        })),
        ai_metrics: { accuracy: summary?.ai_accuracy || 0 },
      };
    } catch (e) { }
    return { records_count: 0, sample_records: [], ai_metrics: { accuracy: 0 } };
  },

  async uploadReferenceDoc(content, filename) {
    try {
      const report = await this.cleanUploadedDataset(content, filename);
      return {
        success: true,
        filename,
        records_count: report?.total_rows_processed || 0,
        new_accuracy: report?.quality_score || 0,
        report,
      };
    } catch (e) { }
    return { success: false, error: 'Upload failed' };
  },

  async retrainAI() {
    try {
      const res = await apiFetch('/ai/retrain', { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) { }
    return { success: false, error: 'Retrain failed' };
  },

  async getMLComparison() {
    try {
      const res = await apiFetch('/ml/compare');
      if (res.ok) return await res.json();
    } catch (e) { }
    return { best_model: '', algorithms: [], forecast_vs_actual: [] };
  },

  async getFinancialAnalytics() {
    try {
      const res = await apiFetch('/finance');
      if (res.ok) return await res.json();
    } catch (e) { }
    return { gross_margin_pct: 0, net_margin_pct: 0, monthly_expenses: [] };
  },

  async getAIBusinessInsights() {
    try {
      const res = await apiFetch('/insights');
      if (res.ok) return await res.json();
    } catch (e) { }
    return { opportunity_score: 0, risk_score: 0, growth_score: 0, recommendations: [] };
  },

  async postAIChatQuery(query) {
    try {
      const res = await apiFetch('/chat', {
        method: 'POST',
        body: JSON.stringify({ query })
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    return { response: 'Unable to reach the AI engine. Please check that the backend server is running.' };
  },

  async getSummary() {
    try {
      const res = await apiFetch('/dashboard/summary');
      if (res.ok) return await res.json();
    } catch (e) { }
    return {
      store: null,
      business_health_score: 0,
      total_revenue: 0,
      total_profit: 0,
      total_orders: 0,
      total_products: 0,
      inventory_value: 0,
      low_stock_count: 0,
      overstock_count: 0,
      ai_accuracy: 0,
      data_cleaning_logs: { quality_score: 0, total_rows_processed: 0 },
      recent_alerts: []
    };
  },

  async getProducts() {
    try {
      const res = await apiFetch('/products');
      if (res.ok) return await res.json();
    } catch (e) { }
    return [];
  },

  async calculateDynamicPricing(productId = null, isPeak = false) {
    try {
      const res = await apiFetch('/pricing/dynamic-calculate', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, is_peak_hour: isPeak })
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    return null;
  },

  async updatePrice(productId, newPrice) {
    try {
      const res = await apiFetch('/pricing/update', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, new_price: newPrice })
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    return { success: false, error: 'Price update failed' };
  },

  async getForecast(productId = null, days = 30) {
    try {
      const res = await apiFetch(`/forecast/${productId || 'PROD-101'}?days=${days}`);
      if (res.ok) return await res.json();
    } catch (e) { }
    return { product_id: productId, forecast_days: days, total_predicted_demand: 0, average_daily_demand: 0, historical_data: [], forecast_data: [] };
  },

  async getInventoryStatus() {
    try {
      const res = await apiFetch('/inventory/status');
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : (data?.items || []);
      }
    } catch (e) { }
    return [];
  },

  async reorderStock(productId, quantity = 50) {
    try {
      const res = await apiFetch('/inventory/reorder', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity })
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    return { success: false, error: 'Reorder failed' };
  },

  async getIoTShelves() {
    try {
      const res = await apiFetch('/iot/shelves');
      if (res.ok) return await res.json();
    } catch (e) { }
    return [];
  },

  async decrementShelf(shelfId, units = 1) {
    try {
      const res = await apiFetch('/iot/shelf/decrement', {
        method: 'POST',
        body: JSON.stringify({ shelf_id: shelfId, units })
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    return { success: false, error: 'Shelf update failed' };
  },

  async getCustomerAnalytics() {
    try {
      const res = await apiFetch('/analytics/customer');
      if (res.ok) return await res.json();
    } catch (e) { }
    return { repeat_customer_rate: 0, average_order_value: 0, total_active_sessions: 0, funnel: [], customers: [] };
  },

  async getRecommendations(userId = null) {
    if (!userId) return { content_based: [], collaborative: [] };
    try {
      const res = await apiFetch(`/recommendations/${userId}`);
      if (res.ok) return await res.json();
    } catch (e) { }
    return { user_id: userId, content_based: [], collaborative: [] };
  },

  async getExecutiveDashboard() {
    try {
      const res = await apiFetch('/executive/dashboard');
      if (res.ok) return await res.json();
    } catch (e) { }
    return this.getSummary();
  },

  async getDecisionRecommendations() {
    try {
      const res = await apiFetch('/decision/recommendations');
      if (res.ok) return await res.json();
    } catch (e) { }
    return { recommendations: [] };
  },

  async simulateScenario(payload) {
    try {
      const res = await apiFetch('/scenario/simulate', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    return { demand: 0, revenue: 0, profit: 0, margin: 0, ending_inventory: 0, assumptions: {} };
  },

  async getModelPerformance() {
    try {
      const res = await apiFetch('/model-performance');
      if (res.ok) return await res.json();
    } catch (e) { }
    return { best_model: '', algorithms: [], forecast_vs_actual: [] };
  },

  async getDataQuality() {
    try {
      const res = await apiFetch('/data-quality');
      if (res.ok) return await res.json();
    } catch (e) { }
    return { quality_score: 0, checks: [], available: false };
  },

  async getOperationalAlerts() {
    try {
      const res = await apiFetch('/alerts');
      if (res.ok) {
        const data = await res.json();
        return { alerts: Array.isArray(data) ? data : (data?.alerts || []) };
      }
    } catch (e) { }
    return { alerts: [] };
  },

  async getAuditLogs() {
    try {
      const res = await apiFetch('/audit-logs');
      if (res.ok) {
        const data = await res.json();
        return { logs: Array.isArray(data) ? data : (data?.logs || []) };
      }
    } catch (e) { }
    return { logs: [] };
  },

  async getUsers() {
    try {
      const res = await apiFetch('/users');
      if (res.ok) return await res.json();
    } catch (e) { }
    return { current_user: { name: 'Admin', role: 'Admin' }, users: [], roles: ['Admin', 'Store Manager', 'Analyst', 'Supplier'] };
  },

  async createUser(userData) {
    try {
      const res = await apiFetch('/users', { method: 'POST', body: JSON.stringify(userData) });
      const data = await res.json();
      if (res.ok) return data;
      return { success: false, error: data?.error || 'Failed to create user' };
    } catch (e) {
      return { success: false, error: 'Server connection error' };
    }
  },

  async updateUser(userId, userData) {
    try {
      const res = await apiFetch(`/users/${userId}`, { method: 'PUT', body: JSON.stringify(userData) });
      const data = await res.json();
      if (res.ok) return data;
      return { success: false, error: data?.error || 'Failed to update user' };
    } catch (e) {
      return { success: false, error: 'Server connection error' };
    }
  },

  async deleteUser(userId) {
    try {
      const res = await apiFetch(`/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) return data;
      return { success: false, error: data?.error || 'Failed to delete user' };
    } catch (e) {
      return { success: false, error: 'Server connection error' };
    }
  },

  async login({ email, username, id, password }) {
    const identifier = (username || id || email || '').trim();
    if (!identifier) return { success: false, error: 'Username is required' };
    if (!password)   return { success: false, error: 'Password is required' };
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: identifier, email: identifier, id: identifier, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) sessionStorage.setItem('neuroretail_auth_token', data.token);
        return data;
      }
      // Always show a generic error — never reveal password hints
      return { success: false, error: data?.error || 'Invalid username or password' };
    } catch (e) {
      return { success: false, error: 'Cannot connect to the authentication server.' };
    }
  },

  async logout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (e) { }
    sessionStorage.removeItem('neuroretail_auth_token');
    return { success: true };
  },

  async getAuthStatus() {
    try {
      const res = await apiFetch('/auth/me');
      if (res.ok) return await res.json();
    } catch (e) { }
    return { authenticated: false };
  },

  async switchRole(role) {
    try {
      const res = await apiFetch('/auth/switch-role', {
        method: 'POST',
        body: JSON.stringify({ role })
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    return { success: false };
  },

  async getCompetitorAnalysis() {
    try {
      const res = await apiFetch('/competitor-analysis');
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : (data?.items || []);
      }
    } catch (e) { }
    return [];
  },

  async getReports() {
    try {
      const res = await apiFetch('/reports');
      if (res.ok) return await res.json();
    } catch (e) { }
    return { report_name: 'NeuroRetail Executive Decision Report', metrics: {}, recommendations: [] };
  },

  // Dataset management
  async listDatasets() {
    try {
      const res = await apiFetch('/datasets');
      if (res.ok) return await res.json();
    } catch (e) { }
    return { datasets: [], active_dataset: null };
  },

  async uploadDataset(formData) {
    try {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/datasets/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      if (res.ok) return await res.json();
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err?.error || 'Upload failed' };
    } catch (e) {
      return { success: false, error: 'Upload failed — server unreachable' };
    }
  },

  async validateDataset(datasetId) {
    try {
      const res = await apiFetch(`/datasets/${datasetId}/validate`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) { }
    return { success: false };
  },

  async processDataset(datasetId, mapping) {
    try {
      const res = await apiFetch(`/datasets/${datasetId}/process`, {
        method: 'POST',
        body: JSON.stringify({ mapping })
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    return { success: false };
  },

  async activateDataset(datasetId) {
    try {
      const res = await apiFetch(`/datasets/${datasetId}/activate`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) { }
    return { success: false };
  },

  async trainDataset(datasetId) {
    try {
      const res = await apiFetch(`/datasets/${datasetId}/train`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) { }
    return { success: false };
  },

  async deleteDataset(datasetId) {
    try {
      const res = await apiFetch(`/datasets/${datasetId}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch (e) { }
    return { success: false };
  }
};
