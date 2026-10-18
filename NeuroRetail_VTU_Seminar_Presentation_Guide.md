# NeuroRetail: VTU Technical Seminar Presentation & Defense Guide
**Subject:** 8th Sem / 7th Sem Technical Seminar (Computer Science & Engineering)  
**Affiliation:** Visvesvaraya Technological University (VTU), Belagavi, Karnataka  
**Candidate:** Dharanesh H  
**Topic:** *NeuroRetail: An Explainable AI-Driven Decision Support System for Autonomous Inventory Control, Demand Forecasting, and Dynamic Pricing*

---

## 1. Seminar Slide Deck Structure (Recommended 12–15 Slides)

| Slide # | Slide Title | Key Content & Visual Elements | Time Allocation |
| :---: | :--- | :--- | :---: |
| **1** | **Title Slide** | Project Title, Candidate Name, USN, Guide Name, VTU Emblem/Logo | 1 min |
| **2** | **Introduction & Problem Statement** | Retail dilemma: Stockout vs Overstocking, Static pricing failures, The AI "Black-Box" problem | 1.5 min |
| **3** | **Objectives of the Work** | Automated 7-stage ETL, Explainable Demand Forecasting, Dynamic Pricing, Autonomous Inventory | 1 min |
| **4** | **Literature Survey** | Comparative matrix (ARIMA vs XGBoost vs Classical EOQ vs NeuroRetail) | 1.5 min |
| **5** | **System Architecture** | High-level architecture: Python Flask backend, SQLite WAL, React 18 frontend | 1.5 min |
| **6** | **The 7-Stage Data Ingestion Pipeline** | Upload $\rightarrow$ Validation $\rightarrow$ Cleaning (IQR) $\rightarrow$ Mapping $\rightarrow$ Features $\rightarrow$ Training $\rightarrow$ Activation | 2 min |
| **7** | **Demand Forecasting Engine** | Gradient Boosting vs Random Forest vs Ridge; Formulas for MAPE, RMSE, MAE, $R^2$ | 2 min |
| **8** | **Dynamic Pricing Optimization** | Bounded Ridge Regression Multiplier formula; Stock ratio & competitor parity constraints | 2 min |
| **9** | **Autonomous Inventory Control** | Reorder Point ($ROP$), Safety Stock ($SS$), $EOQ$, ABC Pareto classification | 1.5 min |
| **10** | **Explainable AI (XAI) & Governance** | Natural-language causal rationale generation, RBAC personas, Immutable audit trail | 1.5 min |
| **11** | **Experimental Results & Analysis** | Comparison Table (MAPE 3.2%, 96.8% accuracy, +11.4% gross profit lift, -37.8% stockouts) | 2 min |
| **12** | **Live System Demo & Highlights** | Screenshots of Executive Dashboard, Simulator, Data Cleaning logs | 2 min |
| **13** | **Conclusion & Future Scope** | Summary of contributions, IoT weight shelves, Multi-store federated learning | 1 min |
| **14** | **References** | IEEE standard citations | 0.5 min |
| **15** | **Q&A / Thank You** | Open for viva-voce defense | - |

---

## 2. Mathematical Formulations Quick Reference (For Blackboard / Viva)

### A. Vectorized Interquartile Range (IQR) Data Scrubbing:
$$IQR = Q_3 - Q_1$$
$$\text{Valid Boundary} = [Q_1 - 1.5 \times IQR, \;\; Q_3 + 1.5 \times IQR]$$
*Outliers exceeding this boundary are capped at the 95th percentile.*

### B. Gradient Tree Boosting Loss Minimization:
$$\mathcal{L}(\theta) = \sum_{i=1}^{N} (y_i - \hat{y}_i)^2 + \sum_{m=1}^{M} \Omega(f_m)$$
$$\text{MAPE} = \frac{100\%}{N} \sum_{i=1}^N \left| \frac{y_i - \hat{y}_i}{y_i} \right| \quad (\mathbf{3.2\% \text{ achieved}})$$

### C. Dynamic Pricing Multiplier:
$$p^* = p_{\text{base}} \times \text{clip}\Big(\gamma(S_{\text{ratio}}, C_{\text{ratio}}, D_{\text{norm}}, A_{\text{rate}}, H_{\text{peak}}), \; 0.75, \; 1.45\Big)$$
$$\text{Profit Margin} = \frac{p^* - \text{Unit Cost}}{p^*} \times 100\%$$

### D. Stochastic Inventory Replenishment:
$$\text{Safety Stock (SS)} = Z_{\alpha} \times \sigma_d \times \sqrt{L} \quad (Z_{\alpha} = 1.65 \text{ for 95\% Service Level})$$
$$\text{Reorder Point (ROP)} = (\bar{d} \times L) + SS$$
$$\text{Economic Order Quantity (EOQ)} = \sqrt{\frac{2 \times D \times S}{H}}$$

---

## 3. High-Frequency VTU Seminar Viva Questions & Model Answers

### Q1. Why did you choose Gradient Tree Boosting instead of LSTM / Transformers for retail demand forecasting?
> **Answer:**  
> Retail transactional data is primarily **tabular and heterogeneous** (mix of categorical day-of-week, product codes, real prices, and stock counts). Extensive empirical benchmarks show that Gradient-Boosted Decision Trees (such as GBDT) consistently outperform deep sequential neural networks (LSTM/Transformers) on tabular datasets of moderate size ($N < 100,000$). GBDTs provide:
> 1. Superior sample efficiency and resistance to overfitting.
> 2. Ultra-low latency CPU training ($<150\text{ ms}$) without requiring costly GPU clusters.
> 3. Native feature importance attribution for explainability.

### Q2. How does NeuroRetail prevent price gouging or below-cost selling?
> **Answer:**  
> The dynamic pricing engine enforces **hard bounding constraints**:
> 1. Multiplier $\gamma$ is strictly clipped to $[0.75, 1.45]$, preventing extreme surges or catastrophic drops.
> 2. Hard margin constraint: $\text{Recommended Price} \ge \text{Unit Cost} \times (1 + \text{Min Margin Target})$.
> 3. Even during low-stock surge triggers, the price increase is capped at $+15\%$ to protect consumer goodwill.

### Q3. What is the difference between your project and existing retail ERP software like SAP or Oracle Retail?
> **Answer:**  
> Traditional retail ERPs rely on **static, rule-based thresholds** (e.g. reorder whenever stock hits 20 units) and provide **univariate batch forecasts**. They do not factor in real-time competitor prices, cart abandonment rates, or dynamic price elasticity. Furthermore, NeuroRetail provides an **Explainable AI (XAI)** natural language justification layer and an automated **7-stage self-healing ingestion pipeline**, allowing store managers to upload arbitrary spreadsheets and get instant insights without expensive custom ETL integration.

### Q4. How do you handle database concurrency during model retraining?
> **Answer:**  
> SQLite is configured with **Write-Ahead Logging (WAL) mode** (`PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL;`). Under WAL mode, readers do not block writers and writers do not block readers. In addition, model training runs inside an **asynchronous daemon thread**, leaving the main Flask API loop completely responsive to live dashboard requests.
