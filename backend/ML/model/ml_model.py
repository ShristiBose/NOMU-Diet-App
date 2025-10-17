import pandas as pd
import json
import os
from datetime import datetime
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from scipy.stats import spearmanr
import numpy as np

# -------------------- 0. History management --------------------
HISTORY_FILE = "recommendation_history.json"
MAX_HISTORY_RUNS = 15
AVG_FOODS_PER_RUN = 5  # assuming ~5 foods recommended per run

def load_history():
    """Load recommendation history from file"""
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, 'r') as f:
            return json.load(f)
    return {"runs": [], "excluded_foods": []}

def save_history(history):
    """Save recommendation history to file"""
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=2)

def update_history(history, new_recommendations):
    """Update history with new recommendations"""
    run_data = {
        "timestamp": datetime.now().isoformat(),
        "foods": new_recommendations
    }
    history["runs"].append(run_data)

    # Keep only last 15 runs
    if len(history["runs"]) > MAX_HISTORY_RUNS:
        history["runs"] = history["runs"][-MAX_HISTORY_RUNS:]

    # Update excluded foods list
    history["excluded_foods"] = []
    for run in history["runs"]:
        history["excluded_foods"].extend(run["foods"])

    # Remove duplicates
    history["excluded_foods"] = list(set(history["excluded_foods"]))
    return history

def get_excluded_foods(history):
    """Get list of foods to exclude from current run"""
    return set(history.get("excluded_foods", []))

# -------------------- Load history --------------------
history = load_history()
excluded_foods = get_excluded_foods(history)
print(f"Loaded history: {len(history['runs'])} previous runs, {len(excluded_foods)} foods to exclude")

# === 🧠 Freshness Control & Safety Reset ===
if len(excluded_foods) > MAX_HISTORY_RUNS * AVG_FOODS_PER_RUN:
    print("🌀 Trimming history to last 15 runs for freshness...")
    excluded_foods = set(list(excluded_foods)[-MAX_HISTORY_RUNS * AVG_FOODS_PER_RUN:])

# === Safety Reset: if all foods are already recommended ===
df_food = pd.read_csv(r"E:\DIET APP\backend\ML\datasets\preprocessed_dataset.csv")
if len(excluded_foods) >= len(df_food):
    print("🌀 All foods have been recommended at least once! Resetting history...")
    excluded_foods = set()
    history = {"runs": [], "excluded_foods": []}
    save_history(history)

# -------------------- 1. User profile --------------------
user_profile = {
    "age": 28,
    "gender": "Male",
    "weight": 87,
    "height": 177,
    "dietPreference": "Non-Vegetarian",
    "allergies": ["Sugar restrictions"],
    "activityLevel": "Active",
    "goals": "Control diabetes",
    "BMR": 1841.25,
    "TDEE": 3176.16,
    "energy_kcal": 3176.16,
    "protein_g": 174.69,
    "carb_g": 337.47,
    "fat_g": 105.87,
    "fiber_g": 35,
    "free_sugar_g": 39.7,
    "cholesterol_mg": 300,
}

# -------------------- 2. Load dataset --------------------
print("Initial dataset size:", len(df_food))
df_food = df_food[~df_food['food_name'].isin(excluded_foods)]
print(f"Dataset size after excluding history: {len(df_food)}")

# -------------------- 3. Compute fitness --------------------
def compute_fitness(food, user_profile):
    targets = {
        "energy_kcal": user_profile['TDEE'] / 4,
        "protein_g": user_profile['protein_g'] / 4,
        "carb_g": user_profile['carb_g'] / 4,
        "fat_g": user_profile['fat_g'] / 4
    }
    energy_score = 1 - abs(food['energy_kcal'] - targets['energy_kcal']) / targets['energy_kcal']
    protein_score = 1 - abs(food['protein_g'] - targets['protein_g']) / targets['protein_g']
    carb_score = 1 - abs(food['carb_g'] - targets['carb_g']) / targets['carb_g']
    fat_score = 1 - abs(food['fat_g'] - targets['fat_g']) / targets['fat_g']
    health_score = food['health_score'] / 100
    nutrient_score = food['nutrient_score'] / 100
    fitness = (0.3*energy_score + 0.2*protein_score + 0.2*carb_score +
               0.1*fat_score + 0.1*health_score + 0.1*nutrient_score)
    return fitness

df_food['fitness_target'] = df_food.apply(lambda x: compute_fitness(x, user_profile), axis=1)

# -------------------- 4. Prepare features --------------------
drop_cols = ['food_id', 'food_name', 'allergies', 'allergy_list']
X = df_food.drop(columns=drop_cols + ['fitness_target'])
bool_cols = X.select_dtypes(include=['bool']).columns
X[bool_cols] = X[bool_cols].astype(int)
cat_cols = X.select_dtypes(include=['object']).columns
X = pd.get_dummies(X, columns=cat_cols, drop_first=True)
y = df_food['fitness_target']

scaler = MinMaxScaler()
X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=X.columns)

# -------------------- 5. Train model --------------------
model = GradientBoostingRegressor()
model.fit(X_scaled, y)
print("Model training complete!")

# -------------------- 6. Recommendation function --------------------
def recommend_top_foods(user_profile, df_food, model, meal_type=None):
    df = df_food.copy()
    if meal_type:
        df = df[df['food_type'].str.lower() == meal_type.lower()]

    if len(df) == 0:
        return pd.DataFrame(columns=['food_name', 'predicted_fitness'])

    X_input = df.drop(columns=drop_cols + ['fitness_target'])
    bool_cols_input = X_input.select_dtypes(include=['bool']).columns
    X_input[bool_cols_input] = X_input[bool_cols_input].astype(int)
    cat_cols_input = X_input.select_dtypes(include=['object']).columns
    X_input = pd.get_dummies(X_input, columns=cat_cols_input, drop_first=True)

    for col in X_scaled.columns:
        if col not in X_input.columns:
            X_input[col] = 0
    X_input = X_input[X_scaled.columns]

    preds = model.predict(X_input)
    df['predicted_fitness'] = preds

    # -------------------- 7. Dietary filters --------------------
    allergy_map = {
        'Milk': 'contains_milk', 'Egg': 'contains_egg', 'Peanut': 'contains_peanut',
        'Tree nut': 'contains_tree_nut', 'Soy': 'contains_soy', 'Wheat': 'contains_wheat',
        'Fish': 'contains_fish', 'Shellfish': 'contains_shellfish', 'Gluten': 'contains_gluten',
        'Sesame': 'contains_sesame', 'Sugar restrictions': None
    }
    mask = pd.Series(True, index=df.index)
    for allergy in user_profile['allergies']:
        col = allergy_map.get(allergy)
        if col:
            mask &= ~df[col]
    if 'Sugar restrictions' in user_profile['allergies']:
        mask &= df['freesugar_g'] <= 0.1 * df['energy_kcal'] / 4
    df = df[mask]

    # -------------------- 8. Veg vs Non-Veg --------------------
    df_veg = df[df['food_group'].str.lower().isin(['vegetarian', 'vegan'])]
    df_nonveg = df[df['food_group'].str.lower().isin(['meat', 'poultry', 'fish', 'egg'])]

    top_veg = df_veg.sort_values(by='predicted_fitness', ascending=False).head(1)
    top_nonveg = df_nonveg.sort_values(by='predicted_fitness', ascending=False).head(1)

    result = pd.concat([top_veg, top_nonveg])

    # --- Remove duplicates + refill if needed ---
    result = result.drop_duplicates(subset=['food_name'])
    if len(result) < 2:
        remaining = df[~df['food_name'].isin(result['food_name'])]
        extra = remaining.sort_values(by='predicted_fitness', ascending=False).head(2 - len(result))
        result = pd.concat([result, extra])

    return result[['food_name', 'predicted_fitness']]

# -------------------- 9. Recommend foods --------------------
top_breakfast = recommend_top_foods(user_profile, df_food, model, meal_type='breakfast')
top_lunch = recommend_top_foods(user_profile, df_food, model, meal_type='lunch')
top_snacks = recommend_top_foods(user_profile, df_food, model, meal_type='snacks')
top_dinner = recommend_top_foods(user_profile, df_food, model, meal_type='dinner')

print("Top breakfast options:\n", top_breakfast)
print("Top lunch options:\n", top_lunch)
print("Top snacks options:\n", top_snacks)
print("Top dinner options:\n", top_dinner)

# -------------------- 10. Save to history --------------------
new_recommendations = []
for df in [top_breakfast, top_lunch, top_snacks, top_dinner]:
    if not df.empty:
        new_recommendations.extend(df['food_name'].tolist())

history = update_history(history, new_recommendations)
save_history(history)

print(f"\n✓ Saved {len(new_recommendations)} new recommendations to history")
print(f"✓ Total runs in history: {len(history['runs'])}")
print(f"✓ Total excluded foods: {len(history['excluded_foods'])}")

# -------------------- 11. Model Evaluation Metrics --------------------
y_pred = model.predict(X_scaled)

mae = mean_absolute_error(y, y_pred)
mse = mean_squared_error(y, y_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y, y_pred)
rho, _ = spearmanr(y, y_pred)

print("\n📊 MODEL PERFORMANCE METRICS 📊")
print(f"Mean Absolute Error (MAE): {mae:.4f}")
print(f"Root Mean Squared Error (RMSE): {rmse:.4f}")
print(f"R² Score: {r2:.4f}")
print(f"Spearman Rank Correlation: {rho:.4f}")

def top_n_accuracy(y_true, y_pred, n=10):
    true_top = set(np.argsort(y_true)[-n:])
    pred_top = set(np.argsort(y_pred)[-n:])
    return len(true_top & pred_top) / n

for n in [5, 10, 20]:
    acc = top_n_accuracy(y, y_pred, n)
    print(f"Top-{n} Accuracy: {acc:.2f}")
