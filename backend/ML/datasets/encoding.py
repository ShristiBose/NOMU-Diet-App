import pandas as pd
from sklearn.preprocessing import OneHotEncoder, MinMaxScaler

# -------------------- 1. User profile --------------------
user_profile = {
    "age": 28,
    "gender": "Male",
    "weight": 87,
    "height": 177,
    "dietPreference": "Vegetarian",
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
    "cholesterol_mg": 300
}

# -------------------- 2. Load food dataset --------------------
df_food = pd.read_csv(r"E:\DIET APP\backend\ML\datasets\preprocessed_dataset.csv")

# -------------------- 3. Encode categorical features --------------------
# Food
food_categorical_cols = ['food_group', 'food_type', 'energy_category']
food_encoder = OneHotEncoder(sparse_output=False, drop='first')
food_encoded = pd.DataFrame(
    food_encoder.fit_transform(df_food[food_categorical_cols]),
    columns=food_encoder.get_feature_names_out(food_categorical_cols)
)
df_food_encoded = pd.concat([df_food.drop(columns=food_categorical_cols), food_encoded], axis=1)

# User
user_categorical_cols = ['gender', 'dietPreference', 'activityLevel', 'goals']
user_encoder = OneHotEncoder(sparse_output=False, drop='first')
user_df = pd.DataFrame([user_profile])
user_encoded = pd.DataFrame(
    user_encoder.fit_transform(user_df[user_categorical_cols]),
    columns=user_encoder.get_feature_names_out(user_categorical_cols)
)
user_numeric_cols = ['age', 'weight', 'height', 'BMR', 'TDEE', 'energy_kcal', 'protein_g',
                     'carb_g', 'fat_g', 'fiber_g', 'free_sugar_g', 'cholesterol_mg']
user_numeric = user_df[user_numeric_cols]
user_processed = pd.concat([user_numeric, user_encoded], axis=1)

# -------------------- 4. Normalize numeric features --------------------
numeric_food_cols = ['energy_kcal', 'carb_g', 'protein_g', 'fat_g', 'freesugar_g', 'fibre_g', 'cholesterol_mg',
                     'protein_calorie_ratio', 'nutrient_score', 'health_score', 'diversity_score',
                     'protein_g_normalized', 'fat_g_normalized', 'carb_g_normalized',
                     'protein_kcal', 'fat_kcal', 'carb_kcal', 'protein_pct', 'fat_pct', 'carb_pct']

food_scaler = MinMaxScaler()
df_food_encoded[numeric_food_cols] = food_scaler.fit_transform(df_food_encoded[numeric_food_cols])

user_numeric_cols_to_scale = user_numeric_cols
user_scaler = MinMaxScaler()
user_processed[user_numeric_cols_to_scale] = user_scaler.fit_transform(user_processed[user_numeric_cols_to_scale])

# -------------------- 5. Handle allergy filters --------------------
allergy_map = {
    'Milk': 'contains_milk',
    'Egg': 'contains_egg',
    'Peanut': 'contains_peanut',
    'Tree nut': 'contains_tree_nut',
    'Soy': 'contains_soy',
    'Wheat': 'contains_wheat',
    'Fish': 'contains_fish',
    'Shellfish': 'contains_shellfish',
    'Gluten': 'contains_gluten',
    'Sesame': 'contains_sesame',
    'Sugar restrictions': None
}

mask = pd.Series(True, index=df_food.index)

# Filter by diet type
mask &= df_food['food_type'] == user_profile['dietPreference']

# Filter allergies
for allergy in user_profile['allergies']:
    col = allergy_map.get(allergy)
    if col:
        mask &= ~df_food[col]

# Handle sugar restriction
if 'Sugar restrictions' in user_profile['allergies']:
    mask &= df_food['freesugar_g'] <= 0.1 * df_food['energy_kcal'] / 4  # 10% of total kcal

# Candidate foods
df_food_filtered_raw = df_food.loc[mask].copy()
print("Preprocessing complete! Number of candidate foods:", len(df_food_filtered_raw))

# -------------------- 6. Fitness function --------------------
user_targets = {
    "energy_kcal": user_profile['TDEE'] / 4,
    "protein_g": user_profile['protein_g'] / 4,
    "carb_g": user_profile['carb_g'] / 4,
    "fat_g": user_profile['fat_g'] / 4,
}

def compute_fitness(food, targets):
    energy_score = 1 - abs(food['energy_kcal'] - targets['energy_kcal']) / targets['energy_kcal']
    protein_score = 1 - abs(food['protein_g'] - targets['protein_g']) / targets['protein_g']
    carb_score = 1 - abs(food['carb_g'] - targets['carb_g']) / targets['carb_g']
    fat_score = 1 - abs(food['fat_g'] - targets['fat_g']) / targets['fat_g']
    
    health_score = food['health_score'] / 100
    nutrient_score = food['nutrient_score'] / 100
    
    fitness = (0.3*energy_score + 0.2*protein_score + 0.2*carb_score + 0.1*fat_score +
               0.1*health_score + 0.1*nutrient_score)
    return fitness

# -------------------- 7. Compute fitness for all foods --------------------
df_food_filtered_raw.loc[:, 'fitness_score'] = df_food_filtered_raw.apply(lambda x: compute_fitness(x, user_targets), axis=1)
df_food_sorted = df_food_filtered_raw.sort_values(by='fitness_score', ascending=False)

# -------------------- 8. Top foods for each meal --------------------
top_breakfast = df_food_sorted.head(5)
top_lunch = df_food_sorted.iloc[5:10]
top_snacks = df_food_sorted.iloc[10:15]
top_dinner = df_food_sorted.iloc[15:20]

print("\nTop breakfast options:\n", top_breakfast[['food_name', 'fitness_score']])
print("\nTop lunch options:\n", top_lunch[['food_name', 'fitness_score']])
print("\nTop snacks options:\n", top_snacks[['food_name', 'fitness_score']])
print("\nTop dinner options:\n", top_dinner[['food_name', 'fitness_score']])
