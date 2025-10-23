import sys 
import json
import os
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import traceback

try:
    # -------------------- 0. Read user profile --------------------
    user_profile = json.loads(sys.stdin.read())
    user_id = user_profile.get("user_id", "default_user")
    print(f"[DEBUG] Loaded user_profile for user_id: {user_id}", file=sys.stderr)

    # ✅ Normalize allergies field to always be a list
    allergies_raw = user_profile.get("allergies", [])
    if isinstance(allergies_raw, str):
        allergies_list = [a.strip() for a in allergies_raw.split(",") if a.strip()]
    elif isinstance(allergies_raw, list):
        allergies_list = [str(a).strip() for a in allergies_raw if a]
    else:
        allergies_list = []
    user_profile["allergies"] = allergies_list
    print(f"[DEBUG] Processed allergies: {user_profile['allergies']}", file=sys.stderr)

    # -------------------- 1. History management --------------------
    HISTORY_DIR = "history"
    os.makedirs(HISTORY_DIR, exist_ok=True)
    HISTORY_FILE = os.path.join(HISTORY_DIR, f"{user_id}_recommendation_history.json")
    MAX_HISTORY_RUNS = 15

    def load_history():
        if os.path.exists(HISTORY_FILE):
            return json.load(open(HISTORY_FILE, "r"))
        return {"runs": [], "excluded_foods": []}

    def save_history(history):
        with open(HISTORY_FILE, "w") as f:
            json.dump(history, f, indent=2)

    def update_history(history, new_recommendations):
        run_data = {"timestamp": datetime.now().isoformat(), "foods": new_recommendations}
        history["runs"].append(run_data)
        if len(history["runs"]) > MAX_HISTORY_RUNS:
            history["runs"] = history["runs"][-MAX_HISTORY_RUNS:]
        history["excluded_foods"] = list(set([food for run in history["runs"] for food in run["foods"]]))
        return history

    history = load_history()
    excluded_foods = set(history.get("excluded_foods", []))
    # ⚙️ Suppressed excluded foods print for cleaner logs

    # -------------------- 2. Load dataset --------------------
    df_food = pd.read_csv("E:/DIET APP/backend/ML/datasets/preprocessed_dataset.csv")
    df_food = df_food[~df_food["food_name"].isin(excluded_foods)]
    if len(excluded_foods) >= len(df_food):
        excluded_foods = set()
        history = {"runs": [], "excluded_foods": []}
        save_history(history)
        df_food = pd.read_csv("E:/DIET APP/backend/ML/datasets/preprocessed_dataset.csv")

    # -------------------- 3. Compute fitness --------------------
    def compute_fitness(food, profile):
        try:
            TDEE = profile.get("TDEE", 2000)
            protein_g = profile.get("protein_g", 50)
            carb_g = profile.get("carb_g", 250)
            fat_g = profile.get("fat_g", 70)
            targets = {
                "energy_kcal": TDEE / 4,
                "protein_g": protein_g / 4,
                "carb_g": carb_g / 4,
                "fat_g": fat_g / 4
            }
            energy_score = 1 - abs(food["energy_kcal"] - targets["energy_kcal"]) / targets["energy_kcal"]
            protein_score = 1 - abs(food["protein_g"] - targets["protein_g"]) / targets["protein_g"]
            carb_score = 1 - abs(food["carb_g"] - targets["carb_g"]) / targets["carb_g"]
            fat_score = 1 - abs(food["fat_g"] - targets["fat_g"]) / targets["fat_g"]
            health_score = food.get("health_score", 50) / 100
            nutrient_score = food.get("nutrient_score", 50) / 100
            fitness = (0.3*energy_score + 0.2*protein_score + 0.2*carb_score +
                       0.1*fat_score + 0.1*health_score + 0.1*nutrient_score)
            return fitness
        except Exception as e:
            print(f"[ERROR] compute_fitness failed for {food['food_name']}: {e}", file=sys.stderr)
            return 0.5

    df_food["fitness_target"] = df_food.apply(lambda x: compute_fitness(x, user_profile), axis=1)
    print(f"[DEBUG] Computed fitness for {len(df_food)} foods", file=sys.stderr)

    # -------------------- 4. Prepare features --------------------
    drop_cols = ["food_id", "food_name", "allergies", "allergy_list"]
    X = df_food.drop(columns=drop_cols + ["fitness_target"])
    bool_cols = X.select_dtypes(include=["bool"]).columns
    X[bool_cols] = X[bool_cols].astype(int)
    cat_cols = X.select_dtypes(include=["object"]).columns
    X = pd.get_dummies(X, columns=cat_cols, drop_first=True)
    y = df_food["fitness_target"]
    scaler = MinMaxScaler()
    X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=X.columns)

    # -------------------- 5. Train model & Evaluate --------------------
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    model = GradientBoostingRegressor()
    model.fit(X_train, y_train)
    print("[DEBUG] Model trained successfully", file=sys.stderr)

    # ✅ Evaluation metrics (printed only in terminal)
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)

    print("\n[MODEL PERFORMANCE METRICS]", file=sys.stderr)
    print(f"MAE  (Mean Absolute Error): {mae:.6f}", file=sys.stderr)
    print(f"MSE  (Mean Squared Error): {mse:.6f}", file=sys.stderr)
    print(f"RMSE (Root Mean Squared Error): {rmse:.6f}", file=sys.stderr)
    print(f"R²   (R-squared): {r2:.6f}", file=sys.stderr)
    print("-----------------------------------------------------------", file=sys.stderr)

    # -------------------- 6. Recommendation function --------------------
    def recommend_top_foods(profile, df_food, model, meal_type=None):
        try:
            df = df_food.copy()
            if meal_type:
                df = df[df["food_type"].str.lower() == meal_type.lower()]
            if df.empty:
                return pd.DataFrame(columns=["food_name", "predicted_fitness"])

            X_input = df.drop(columns=drop_cols + ["fitness_target"])
            bool_cols_input = X_input.select_dtypes(include=["bool"]).columns
            X_input[bool_cols_input] = X_input[bool_cols_input].astype(int)
            cat_cols_input = X_input.select_dtypes(include=["object"]).columns
            X_input = pd.get_dummies(X_input, columns=cat_cols_input, drop_first=True)
            for col in X_scaled.columns:
                if col not in X_input.columns:
                    X_input[col] = 0
            X_input = X_input[X_scaled.columns]

            df["predicted_fitness"] = model.predict(X_input)

            allergy_map = {
                "Milk": "contains_milk", "Egg": "contains_egg", "Peanut": "contains_peanut",
                "Tree nut": "contains_tree_nut", "Soy": "contains_soy", "Wheat": "contains_wheat",
                "Fish": "contains_fish", "Shellfish": "contains_shellfish", "Gluten": "contains_gluten",
                "Sesame": "contains_sesame", "Sugar restrictions": None
            }
            mask = pd.Series(True, index=df.index)
            
            for allergy in profile.get("allergies", []):
                col = allergy_map.get(allergy)
                if col:
                    mask &= ~df[col]
            if "Sugar restrictions" in profile.get("allergies", []):
                mask &= df["freesugar_g"] <= 0.1 * df["energy_kcal"] / 4
            df = df[mask]

            df_veg = df[df["food_group"].str.lower().isin(["vegetarian", "vegan"])]
            df_nonveg = df[df["food_group"].str.lower().isin(["meat", "poultry", "fish", "egg"])]
            top_veg = df_veg.sort_values("predicted_fitness", ascending=False).head(1)
            top_nonveg = df_nonveg.sort_values("predicted_fitness", ascending=False).head(1)

            result = pd.concat([top_veg, top_nonveg]).drop_duplicates(subset=["food_name"])
            if len(result) < 2:
                remaining = df[~df["food_name"].isin(result["food_name"])]
                extra = remaining.sort_values("predicted_fitness", ascending=False).head(2 - len(result))
                result = pd.concat([result, extra])
            return result[["food_name", "predicted_fitness"]]
        except Exception as e:
            print(f"[ERROR] recommend_top_foods failed: {e}", file=sys.stderr)
            print(traceback.format_exc(), file=sys.stderr)
            return pd.DataFrame(columns=["food_name", "predicted_fitness"])

    # -------------------- 7. Generate meals --------------------
    meals = {
        "Breakfast": recommend_top_foods(user_profile, df_food, model, "breakfast")["food_name"].tolist(),
        "Lunch": recommend_top_foods(user_profile, df_food, model, "lunch")["food_name"].tolist(),
        "Snacks": recommend_top_foods(user_profile, df_food, model, "snacks")["food_name"].tolist(),
        "Dinner": recommend_top_foods(user_profile, df_food, model, "dinner")["food_name"].tolist()
    }

    # -------------------- 8. Update history --------------------
    new_recommendations = [f for lst in meals.values() for f in lst]
    history = update_history(history, new_recommendations)
    save_history(history)

    # -------------------- 9. Output --------------------
    output = {"meals": meals, "history": history}
    print(json.dumps(output))

except Exception as e:
    error_output = {"error": str(e), "traceback": traceback.format_exc()}
    print(json.dumps(error_output))
    sys.exit(1)
