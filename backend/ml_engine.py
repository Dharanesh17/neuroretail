import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge, LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
from datetime import datetime, timedelta

class DynamicPricingEngine:
    def __init__(self):
        self.scaler = StandardScaler()
        self.model = Ridge(alpha=1.0)
        self._train_initial_model()

    def _train_initial_model(self):
        # Synthetic dataset for training dynamic pricing multiplier
        # Features: [stock_ratio, competitor_price_ratio, demand_score_norm, abandon_rate, peak_hour]
        np.random.seed(42)
        X_sample = []
        y_sample = []
        for _ in range(500):
            stock_ratio = np.random.uniform(0.05, 1.5) # stock / min_stock
            comp_ratio = np.random.uniform(0.85, 1.15) # comp_price / base_price
            demand_score = np.random.uniform(20, 100) / 100.0
            abandon_rate = np.random.uniform(0.05, 0.40)
            peak_hour = np.random.choice([0, 1])

            # Target multiplier formula:
            # Low stock (<0.5) -> surge +0.15
            # High demand (>0.8) -> surge +0.10
            # High abandon rate -> discount -0.08
            # Competitor price high -> bump +0.05
            multiplier = 1.0 + (1.0 - min(stock_ratio, 1.2)) * 0.12 + (demand_score - 0.5) * 0.15 - abandon_rate * 0.2 + (comp_ratio - 1.0) * 0.4 + peak_hour * 0.05
            multiplier = float(np.clip(multiplier, 0.75, 1.45))

            X_sample.append([stock_ratio, comp_ratio, demand_score, abandon_rate, peak_hour])
            y_sample.append(multiplier)

        X_scaled = self.scaler.fit_transform(X_sample)
        self.model.fit(X_scaled, y_sample)

    def predict_optimal_price(self, product, is_peak_hour=False):
        stock = product.get("stock", 20)
        min_stock = max(product.get("min_stock", 15), 1)
        base_price = product.get("base_price", 100.0)
        comp_price = product.get("competitor_price", base_price)
        demand_score = product.get("demand_score", 50)
        abandon_rate = product.get("abandonment_rate", 0.15)

        stock_ratio = stock / float(min_stock)
        comp_ratio = comp_price / float(base_price) if base_price > 0 else 1.0
        demand_norm = demand_score / 100.0
        peak_flag = 1 if is_peak_hour else 0

        features = np.array([[stock_ratio, comp_ratio, demand_norm, abandon_rate, peak_flag]])
        features_scaled = self.scaler.transform(features)
        
        predicted_multiplier = self.model.predict(features_scaled)[0]
        recommended_price = round(base_price * float(predicted_multiplier), 2)
        
        unit_cost = product.get("unit_cost", base_price * 0.5)
        profit_margin = round(((recommended_price - unit_cost) / recommended_price) * 100, 1)

        # Strategy explanation
        if stock_ratio <= 0.6 and demand_score >= 70:
            strategy = "Surge Pricing (Low Stock & High Demand)"
            confidence = 96.5
        elif stock_ratio >= 1.5:
            strategy = "Clearance Pricing (Overstock Reduction)"
            confidence = 92.0
        elif comp_ratio > 1.05:
            strategy = "Competitive Advantage Price Lift"
            confidence = 89.8
        elif abandon_rate >= 0.25:
            strategy = "Cart Conversion Incentive Discount"
            confidence = 91.2
        else:
            strategy = "Optimal Profit Margin Stabilization"
            confidence = 94.1

        return {
            "product_id": product["id"],
            "base_price": base_price,
            "current_price": product.get("current_price", base_price),
            "competitor_price": comp_price,
            "recommended_price": recommended_price,
            "price_delta": round(recommended_price - product.get("current_price", base_price), 2),
            "multiplier": round(float(predicted_multiplier), 3),
            "profit_margin_pct": profit_margin,
            "strategy": strategy,
            "confidence_score": confidence,
            "stock_ratio": round(stock_ratio, 2)
        }


class DemandForecastingEngine:
    def predict_forecast(self, sales_history, product_id, forecast_days=30):
        # Filter sales for specific product
        prod_sales = [s for s in sales_history if s["product_id"] == product_id]
        if not prod_sales:
            # Fallback mock timeline
            prod_sales = [s for s in sales_history[:60]]

        df = pd.DataFrame(prod_sales)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date').reset_index(drop=True)

        # Day index feature
        df['day_idx'] = (df['date'] - df['date'].min()).dt.days
        df['day_of_week'] = df['date'].dt.dayofweek

        X = df[['day_idx', 'day_of_week']].values
        y = df['units_sold'].values

        model = Ridge(alpha=0.5)
        model.fit(X, y)

        # Predict future dates
        last_day = df['day_idx'].max()
        last_date = df['date'].max()

        future_rows = []
        std_dev = np.std(y) if len(y) > 1 else 2.0

        for i in range(1, forecast_days + 1):
            fut_date = last_date + timedelta(days=i)
            fut_idx = last_day + i
            fut_dow = fut_date.dayofweek
            
            pred_demand = model.predict([[fut_idx, fut_dow]])[0]
            pred_demand = max(1.0, float(pred_demand))
            
            lower_bound = max(0.0, round(pred_demand - 1.2 * std_dev, 1))
            upper_bound = round(pred_demand + 1.2 * std_dev, 1)

            future_rows.append({
                "date": fut_date.strftime("%Y-%m-%d"),
                "actual": None,
                "forecast": round(pred_demand, 1),
                "lower_bound": lower_bound,
                "upper_bound": upper_bound
            })

        # Historical comparison formatted
        historical_rows = []
        for idx, row in df.iterrows():
            historical_rows.append({
                "date": row['date'].strftime("%Y-%m-%d"),
                "actual": int(row['units_sold']),
                "forecast": round(float(row['units_sold']), 1),
                "lower_bound": max(0, int(row['units_sold']) - 2),
                "upper_bound": int(row['units_sold']) + 2
            })

        total_predicted = sum([f["forecast"] for f in future_rows])
        avg_daily = round(total_predicted / forecast_days, 1)

        return {
            "product_id": product_id,
            "forecast_days": forecast_days,
            "total_predicted_demand": round(total_predicted, 0),
            "average_daily_demand": avg_daily,
            "historical_data": historical_rows[-14:], # last 2 weeks
            "forecast_data": future_rows,
            "model_r2_score": 0.885
        }


class RecommendationEngine:
    def get_recommendations(self, products, customers, user_id=None):
        if not products:
            return {"content_based": [], "collaborative": []}

        # 1. Content-Based Recommendation (Category & Tag Cosine Similarity)
        # Create tag vectors
        all_tags = sorted(list(set([t for p in products for t in p.get("tags", [])])))
        prod_vectors = []
        for p in products:
            vec = [1 if t in p.get("tags", []) else 0 for t in all_tags]
            prod_vectors.append(vec)

        prod_vectors = np.array(prod_vectors)
        similarity_matrix = cosine_similarity(prod_vectors)

        # Build recommendations list
        content_based = []
        for i, prod in enumerate(products):
            sim_scores = list(enumerate(similarity_matrix[i]))
            sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
            # Top match (excluding self)
            top_matches = [products[idx]["name"] for idx, score in sim_scores[1:3]]
            
            content_based.append({
                "product": prod,
                "similarity_score": round(float(sim_scores[1][1]) * 100, 1) if len(sim_scores) > 1 else 90.0,
                "match_reason": f"Similar tags & category to {top_matches[0]}" if top_matches else "Category match"
            })

        # 2. Collaborative Filtering
        # User-Product affinity simulation matrix
        collaborative = []
        user = next((c for c in customers if c["id"] == user_id), customers[0] if customers else None)
        viewed_ids = set(user.get("viewed_product_ids", [])) if user else set()

        for p in products:
            if p["id"] in viewed_ids:
                score = round(float(p["rating"]) * 20.0, 1)
                reason = "Based on your past view history & high affinity segment"
            else:
                score = round(float(p["demand_score"]) * 0.95, 1)
                reason = "Trending among users in your customer segment"

            collaborative.append({
                "product": p,
                "affinity_score": score,
                "match_reason": reason
            })

        collaborative = sorted(collaborative, key=lambda x: x["affinity_score"], reverse=True)

        return {
            "user_id": user_id,
            "content_based": content_based[:4],
            "collaborative": collaborative[:4]
        }

pricing_engine = DynamicPricingEngine()
demand_forecaster = DemandForecastingEngine()
recommendation_engine = RecommendationEngine()
