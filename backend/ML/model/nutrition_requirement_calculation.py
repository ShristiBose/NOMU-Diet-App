import sys
import json

def calculate_nutrition_requirements(age, gender, height_cm, weight_kg,
                                     activity_level, goal_type, disease):
    """Calculate energy and macronutrient requirements based on user profile."""

    # --- 1️⃣ Calculate BMR (Mifflin-St Jeor) ---
    if gender.lower() == 'male':
        BMR = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:
        BMR = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161

    # --- 2️⃣ Activity multiplier ---
    activity_factors = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very active": 1.9
    }
    TDEE = BMR * activity_factors.get(activity_level.lower(), 1.2)

    # --- 3️⃣ Goal adjustment ---
    goal_factors = {
        "maintain": 1.0,
        "weight loss": 0.85,
        "weight gain": 1.15
    }
    TDEE *= goal_factors.get(goal_type.lower(), 1.0)

    # --- 4️⃣ Base macro split ---
    protein_g = (TDEE * 0.20) / 4
    fat_g     = (TDEE * 0.30) / 9
    carb_g    = (TDEE * 0.50) / 4
    fiber_g   = 30
    free_sugar_g  = (TDEE * 0.10) / 4
    cholesterol_mg = 300

    # --- 5️⃣ Disease-specific modifications ---
    disease = disease.lower()
    
    if disease == "diabetes":
        carb_g *= 0.85
        protein_g *= 1.1
        fiber_g += 5
        free_sugar_g *= 0.5

    elif disease == "hypertension":
        fat_g *= 0.9
        cholesterol_mg *= 0.8

    elif disease == "hyperlipidemia":
        fat_g *= 0.8
        cholesterol_mg *= 0.6

    elif disease == "pcos":
        protein_g *= 1.15
        carb_g *= 0.85
        fiber_g += 5

    elif disease == "thyroid disorders":
        # Hypothyroidism may need slightly higher protein and energy
        protein_g *= 1.05

    elif disease == "obesity":
        TDEE *= 0.9
        carb_g *= 0.9
        fat_g *= 0.9

    elif disease == "underweight":
        TDEE *= 1.1
        protein_g *= 1.1
        fat_g *= 1.1

    elif disease == "heart disease":
        fat_g *= 0.75
        cholesterol_mg *= 0.6

    elif disease == "kidney disease":
        protein_g *= 0.8  # depending on stage, protein may be restricted
        sodium_mg = 1500  # can add as an extra output if needed

    elif disease == "liver disease":
        protein_g *= 0.85  # mild restriction
        fat_g *= 0.85

    elif disease == "celiac disease":
        # gluten-free: no macro adjustment, just note restriction
        pass

    elif disease == "lactose intolerance":
        # avoid dairy; no macro adjustment
        pass

    elif disease == "anemia":
        iron_mg = 18  # can add as extra output
        protein_g *= 1.1

    elif disease == "gastrointestinal disorders":
        fiber_g *= 0.75  # if sensitive, reduce fiber
        fat_g *= 0.9

    elif disease == "pregnancy":
        TDEE *= 1.2
        protein_g *= 1.2
        iron_mg = 27
        folate_mcg = 400

    elif disease == "other" or disease == "none":
        pass  # no changes

    # --- 6️⃣ Round and return ---
    results = {
        "BMR": round(BMR, 2),
        "TDEE": round(TDEE, 2),
        "energy_kcal": round(TDEE, 2),
        "protein_g": round(protein_g, 2),
        "carb_g": round(carb_g, 2),
        "fat_g": round(fat_g, 2),
        "fiber_g": round(fiber_g, 2),
        "free_sugar_g": round(free_sugar_g, 2),
        "cholesterol_mg": round(cholesterol_mg, 2)
    }

    # Add optional extra nutrients if applicable
    if disease in ["kidney disease"]:
        results["sodium_mg"] = sodium_mg
    if disease in ["anemia"]:
        results["iron_mg"] = iron_mg
    if disease in ["pregnancy"]:
        results["iron_mg"] = iron_mg
        results["folate_mcg"] = folate_mcg

    return results


if __name__ == "__main__":
    # input comes from Node.js
    user_data = json.loads(sys.stdin.read())
    result = calculate_nutrition_requirements(**user_data)
    print(json.dumps(result))
