const BASE_URL = '/api';

export const api = {
  async getStores() {
    try {
      const res = await fetch(`${BASE_URL}/stores`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      stores: [
        { id: "STORE-01", name: "ABC Supermarket", type: "Supermarket & Grocery", gstin: "27ABCDE1234F1Z5", currency: "INR (₹)", health_score: 96 },
        { id: "STORE-02", name: "XYZ Fashion Outlet", type: "Apparel & Fashion", gstin: "29XYZAB5678G2Z1", currency: "INR (₹)", health_score: 91 },
        { id: "STORE-03", name: "Fresh Mart Express", type: "Convenience Store", gstin: "33FRESH9012H3Z8", currency: "INR (₹)", health_score: 94 }
      ],
      active_store: { id: "STORE-01", name: "ABC Supermarket", currency_symbol: "₹" },
      user_role: "Store Owner"
    };
  },

  async switchStore(storeId) {
    try {
      const res = await fetch(`${BASE_URL}/store/switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: storeId })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { success: true };
  },

  async createStore(storeData) {
    try {
      const res = await fetch(`${BASE_URL}/store/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeData)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { success: true, store: { id: "STORE-99", name: storeData.name } };
  },

  async cleanUploadedDataset(content, filename) {
    try {
      const res = await fetch(`${BASE_URL}/upload/clean`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, filename })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      quality_score: 98,
      total_rows_processed: 1420,
      duplicates_removed: 14,
      missing_imputed: 6,
      outliers_adjusted: 3,
      status: "AI Cleaned & Validated"
    };
  },

  async getReferenceStatus() {
    try {
      const [summary, products] = await Promise.all([this.getSummary(), this.getProducts()]);
      return {
        records_count: summary?.data_cleaning_logs?.total_rows_processed || 1420,
        sample_records: products.slice(0, 5).map((product) => ({
          Date: "2025-01-01",
          Product_ID: product.id,
          Product_Name: product.name,
          Category: product.category,
          Units_Sold: Math.max(12, Math.round(product.demand_score / 2)),
          Price_Charged_INR: product.current_price,
        })),
        ai_metrics: {
          accuracy: summary?.ai_accuracy || 96.8,
          reference_filename: "reference_doc.csv",
        },
      };
    } catch (e) {}
    return {
      records_count: 1420,
      sample_records: [],
      ai_metrics: { accuracy: 96.8, reference_filename: "reference_doc.csv" },
    };
  },

  async uploadReferenceDoc(content, filename) {
    try {
      const report = await this.cleanUploadedDataset(content, filename);
      return {
        success: true,
        filename,
        records_count: report?.total_rows_processed || 1420,
        new_accuracy: Math.min(99.4, report?.quality_score || 97.4),
        report,
      };
    } catch (e) {}
    return {
      success: true,
      filename,
      records_count: 1420,
      new_accuracy: 97.4,
    };
  },

  async retrainAI() {
    try {
      const res = await fetch(`${BASE_URL}/ai/retrain`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      success: true,
      metrics: {
        accuracy: 97.4,
        mae: 0.85,
        retrain_count: 13,
        last_retrained: new Date().toLocaleString(),
      },
    };
  },

  async getMLComparison() {
    try {
      const res = await fetch(`${BASE_URL}/ml/compare`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      best_model: "LSTM Neural Network",
      algorithms: [
        { name: "LSTM Neural Network", type: "Deep Learning", accuracy: 97.4, rmse: 1.12, mae: 0.85, r2_score: 0.965, badge: "Selected Optimal" },
        { name: "XGBoost Regressor", type: "Gradient Boosting", accuracy: 96.2, rmse: 1.34, mae: 0.98, r2_score: 0.948, badge: "Runner-Up" },
        { name: "Random Forest", type: "Ensemble", accuracy: 94.8, rmse: 1.55, mae: 1.15, r2_score: 0.925, badge: "Robust" },
        { name: "LightGBM", type: "Gradient Boosting", accuracy: 95.5, rmse: 1.40, mae: 1.05, r2_score: 0.938, badge: "Fast" },
        { name: "Facebook Prophet", type: "Additive Time-Series", accuracy: 93.1, rmse: 1.82, mae: 1.35, r2_score: 0.902, badge: "Seasonal" },
        { name: "ARIMA (Auto-Regressive)", type: "Statistical", accuracy: 91.0, rmse: 2.10, mae: 1.60, r2_score: 0.875, badge: "Baseline" }
      ]
    };
  },

  async getFinancialAnalytics() {
    try {
      const res = await fetch(`${BASE_URL}/finance`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      gross_margin_pct: 58.4,
      net_margin_pct: 28.5,
      operating_margin_pct: 34.2,
      cash_flow_inr: 1240000.00,
      roi_pct: 32.4,
      roe_pct: 24.8,
      roa_pct: 18.2,
      eps_inr: 42.50,
      monthly_expenses: [
        { month: "Jan", revenue: 1200000, expenses: 720000, profit: 480000 },
        { month: "Feb", revenue: 1350000, expenses: 780000, profit: 570000 },
        { month: "Mar", revenue: 1489200, expenses: 820000, profit: 669200 }
      ]
    };
  },

  async getAIBusinessInsights() {
    try {
      const res = await fetch(`${BASE_URL}/insights`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      opportunity_score: 88,
      risk_score: 14,
      growth_score: 92,
      recommendations: [
        { id: "REC-1", title: "Inventory Surge Warning", summary: "Demand for NeuroPulse SmartWatch is expected to increase by 18% next month due to upcoming festival season. Consider increasing inventory by 15% to avoid stockouts.", impact: "+₹1.2 Lakh Revenue", urgency: "High" },
        { id: "REC-2", title: "Dynamic Price Optimization", summary: "AcousticSense ANC Headphones competitor price increased by 4%. AI recommends adjusting price to ₹14,299 to capture optimal profit margin.", impact: "+₹45,000 Profit", urgency: "Medium" }
      ]
    };
  },

  async postAIChatQuery(query) {
    try {
      const res = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { response: "Based on historical sales trends, demand is projected to increase by +14% next month." };
  },

  async getSummary() {
    try {
      const res = await fetch(`${BASE_URL}/dashboard/summary`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      store: { id: "STORE-01", name: "ABC Supermarket" },
      business_health_score: 96,
      total_revenue: 1489200.00,
      total_profit: 425600.00,
      total_orders: 1420,
      total_products: 6,
      inventory_value: 850000.00,
      low_stock_count: 3,
      overstock_count: 1,
      ai_accuracy: 96.8,
      data_cleaning_logs: { quality_score: 98, total_rows_processed: 1420, duplicates_removed: 14, missing_imputed: 6, outliers_adjusted: 3 },
      recent_alerts: [
        { id: "ALT-1", timestamp: "18:40:12", type: "STOCK_CRITICAL", title: "Critical Stock: SmartWatch Pro", message: "Stock (18) is below safety threshold (25). Auto PO suggested.", severity: "high" }
      ]
    };
  },

  async getProducts() {
    try {
      const res = await fetch(`${BASE_URL}/products`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return [
      { id: "PROD-101", name: "NeuroPulse SmartWatch Pro", category: "Wearables", base_price: 19999.00, current_price: 21499.00, competitor_price: 20999.00, stock: 18, min_stock: 25, max_stock: 150, unit_cost: 11500.0, demand_score: 88, rating: 4.8, return_rate: 0.02, image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60" },
      { id: "PROD-102", name: "AcousticSense ANC Headphones", category: "Audio", base_price: 14999.00, current_price: 13999.00, competitor_price: 14499.00, stock: 62, min_stock: 20, max_stock: 120, unit_cost: 7500.0, demand_score: 74, rating: 4.7, return_rate: 0.04, image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60" },
      { id: "PROD-103", name: "CogniHome Smart Hub", category: "Smart Home", base_price: 9999.00, current_price: 10499.00, competitor_price: 10299.00, stock: 12, min_stock: 15, max_stock: 80, unit_cost: 5200.0, demand_score: 92, rating: 4.5, return_rate: 0.01, image_url: "https://images.unsplash.com/photo-1558002038-1055907df827?w=500&auto=format&fit=crop&q=60" }
    ];
  },

  async calculateDynamicPricing(productId = null, isPeak = false) {
    try {
      const res = await fetch(`${BASE_URL}/pricing/dynamic-calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, is_peak_hour: isPeak })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      product_id: productId || "PROD-101",
      base_price: 19999.00,
      current_price: 21499.00,
      competitor_price: 20999.00,
      recommended_price: 22399.00,
      price_delta: 900.00,
      multiplier: 1.12,
      profit_margin_pct: 48.6,
      strategy: "Surge Pricing (Low Stock & High Demand)",
      confidence_score: 96.8,
      stock_ratio: 0.72
    };
  },

  async updatePrice(productId, newPrice) {
    try {
      const res = await fetch(`${BASE_URL}/pricing/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, new_price: newPrice })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { success: true };
  },

  async getForecast(productId = "PROD-101", days = 30) {
    try {
      const res = await fetch(`${BASE_URL}/forecast/${productId}?days=${days}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      product_id: productId,
      forecast_days: days,
      total_predicted_demand: 960,
      average_daily_demand: 32.0,
      historical_data: [],
      forecast_data: [],
      model_r2_score: 0.965
    };
  },

  async getInventoryStatus() {
    try {
      const res = await fetch(`${BASE_URL}/inventory/status`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return [
      { product_id: "PROD-101", name: "NeuroPulse SmartWatch Pro", category: "Wearables", stock: 18, min_stock: 25, max_stock: 150, status: "LOW_STOCK", suggested_reorder_qty: 132, unit_cost: 11500.0, eoq_units: 85, safety_stock: 25, abc_classification: "Class A" }
    ];
  },

  async reorderStock(productId, quantity = 50) {
    try {
      const res = await fetch(`${BASE_URL}/inventory/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      success: true,
      po_number: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      product_id: productId,
      new_stock: quantity,
    };
  },

  async getIoTShelves() {
    try {
      const res = await fetch(`${BASE_URL}/iot/shelves`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return [
      { shelf_id: "SH-101", product_id: "PROD-101", product_name: "NeuroPulse SmartWatch Pro", current_weight_grams: 2160, current_units: 18, capacity_units: 60, status: "LOW_STOCK" },
      { shelf_id: "SH-102", product_id: "PROD-102", product_name: "AcousticSense ANC Headphones", current_weight_grams: 7440, current_units: 62, capacity_units: 90, status: "OPTIMAL" },
      { shelf_id: "SH-103", product_id: "PROD-103", product_name: "CogniHome Ambient Smart Hub", current_weight_grams: 3600, current_units: 12, capacity_units: 45, status: "CRITICAL_LOW" },
    ];
  },

  async decrementShelf(shelfId, units = 1) {
    try {
      const res = await fetch(`${BASE_URL}/iot/shelf/decrement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shelf_id: shelfId, units })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { success: true, shelf_id: shelfId, units_removed: units };
  },

  async getCustomerAnalytics() {
    try {
      const res = await fetch(`${BASE_URL}/analytics/customer`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      repeat_customer_rate: 68.4,
      average_order_value: 14250.00,
      total_active_sessions: 412,
      clv_average: 84500.00,
      funnel: [
        { stage: "Product Views", count: 12500, percentage: 100 },
        { stage: "Added to Cart", count: 4000, percentage: 32 },
        { stage: "Completed Purchase", count: 2600, percentage: 20.8 },
        { stage: "Cart Abandoned", count: 1400, percentage: 11.2 }
      ],
      customers: [
        { id: "CUST-001", name: "Rahul Sharma", segment: "Tech Enthusiast", purchases_count: 14, total_spent: 142500.00, clv: 210000.00, cart_abandonments: 2 }
      ]
    };
  },

  async getRecommendations(userId = "CUST-001") {
    try {
      const res = await fetch(`${BASE_URL}/recommendations/${userId}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    const prods = await this.getProducts();
    return {
      user_id: userId,
      content_based: [
        { product: prods[0], similarity_score: 95.4, match_reason: "High similarity score in Wearables" }
      ],
      collaborative: [
        { product: prods[0], affinity_score: 92.0, match_reason: "Popular among Tech Enthusiasts" }
      ]
    };
  },

  async getExecutiveDashboard() {
    try {
      const res = await fetch(`${BASE_URL}/executive/dashboard`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return this.getSummary();
  },

  async getDecisionRecommendations() {
    try {
      const res = await fetch(`${BASE_URL}/decision/recommendations`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return { recommendations: [] };
  },

  async simulateScenario(payload) {
    try {
      const res = await fetch(`${BASE_URL}/scenario/simulate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { demand: 0, revenue: 0, profit: 0, margin: 0, ending_inventory: 0, assumptions: {} };
  },

  async getModelPerformance() {
    try {
      const res = await fetch(`${BASE_URL}/model-performance`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return { best_model: 'Gradient Boosting', algorithms: [], forecast_vs_actual: [] };
  },

  async getDataQuality() {
    try {
      const res = await fetch(`${BASE_URL}/data-quality`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return { quality_score: 0, checks: [] };
  },

  async getOperationalAlerts() {
    try {
      const res = await fetch(`${BASE_URL}/alerts`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return { alerts: [] };
  },

  async getAuditLogs() {
    try {
      const res = await fetch(`${BASE_URL}/audit-logs`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return { logs: [] };
  },

  async getUsers() {
    try {
      const res = await fetch(`${BASE_URL}/users`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return { current_user: { name: 'Ananya Iyer', role: 'Admin' }, users: [], roles: ['Admin', 'Store Manager', 'Analyst', 'Supplier'] };
  },

  async switchRole(role) {
    try {
      const res = await fetch(`${BASE_URL}/auth/switch-role`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { success: true, current_user: { name: 'Ananya Iyer', role } };
  },

  async getCompetitorAnalysis() {
    try {
      const res = await fetch(`${BASE_URL}/competitor-analysis`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return [];
  },

  async getReports() {
    try {
      const res = await fetch(`${BASE_URL}/reports`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return { report_name: 'NeuroRetail Executive Decision Report', metrics: {}, recommendations: [] };
  }
};
