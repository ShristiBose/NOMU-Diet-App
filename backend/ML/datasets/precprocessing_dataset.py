import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler

def preprocess_food_dataset(input_file, output_file= r'E:\DIET APP\backend\ML\datasets\preprocessed_dataset.csv'):
    """
    Preprocess food dataset for diet recommendation app.
    
    Args:
        input_file (str): Path to the input CSV file
        output_file (str): Path to save the preprocessed CSV file
    
    Returns:
        pd.DataFrame: Preprocessed dataframe
    """
    
    print("Step 1: Loading CSV file...")
    df = pd.read_csv(input_file)
    print(f"Loaded {len(df)} rows and {len(df.columns)} columns")
    
    # Step 2: Drop unnecessary columns and rename ID column
    print("\nStep 2: Handling ID column and dropping unnecessary columns...")
    
    # Rename Unnamed: 0 to food_id for clarity
    if 'Unnamed: 0' in df.columns:
        df = df.rename(columns={'Unnamed: 0': 'food_id'})
        print("Renamed 'Unnamed: 0' to 'food_id'")
    
    columns_to_drop = ['food_code']
    existing_cols_to_drop = [col for col in columns_to_drop if col in df.columns]
    if existing_cols_to_drop:
        df = df.drop(columns=existing_cols_to_drop)
        print(f"Dropped columns: {existing_cols_to_drop}")
    else:
        print("No columns to drop")
    
    # Step 3: Check for missing values
    print("\nStep 3: Handling missing values...")
    print("Missing values before processing:")
    print(df.isnull().sum()[df.isnull().sum() > 0])
    
    # Define numeric and categorical columns
    numeric_cols = ['energy_kcal', 'carb_g', 'protein_g', 'fat_g', 'freesugar_g', 
                    'fibre_g', 'cholesterol_mg', 'protein_calorie_ratio', 
                    'nutrient_score', 'health_score', 'diversity_score', 'Serving_Size_g']
    categorical_cols = ['food_name', 'food_group_nin', 'allergies', 'region', 
                        'food_type', 'energy_category']
    
    # Fill missing numeric values with 0
    for col in numeric_cols:
        if col in df.columns:
            df[col] = df[col].fillna(0)
    
    # Fill missing categorical values with 'unknown'
    for col in categorical_cols:
        if col in df.columns:
            df[col] = df[col].fillna('unknown')
    
    print("Missing values filled successfully")
    
    # Step 4: Fix column name typos
    print("\nStep 4: Fixing column name typos...")
    rename_dict = {
        'protien_g': 'protein_g',
        'cholestrol_g': 'cholesterol_g',
        'cholestrol_mg': 'cholesterol_mg',
        'serving size': 'serving_size',
        'Serving_Size_g': 'serving_size_g',
        'food_group_nin': 'food_group',
        'nutrient-score': 'nutrient_score'
    }
    # Only rename columns that exist
    rename_dict = {k: v for k, v in rename_dict.items() if k in df.columns}
    df = df.rename(columns=rename_dict)
    print(f"Renamed columns: {rename_dict}")
    
    # Step 5: Convert string columns to lowercase
    print("\nStep 5: Converting string columns to lowercase...")
    string_cols = ['food_name', 'food_group', 'allergies', 'region', 'food_type']
    for col in string_cols:
        if col in df.columns:
            df[col] = df[col].astype(str).str.lower().str.strip()
    print("String columns converted to lowercase")
    
    # Step 6: Handle allergies
    print("\nStep 6: Processing allergies...")
    
    # Common allergens to create flags for
    allergens = ['milk', 'egg', 'peanut', 'tree nut', 'soy', 'wheat', 
                 'fish', 'shellfish', 'gluten', 'sesame']
    
    if 'allergies' in df.columns:
        # Split comma-separated allergies into lists
        df['allergy_list'] = df['allergies'].apply(
            lambda x: [a.strip() for a in str(x).split(',') if a.strip() and a.strip() != 'unknown']
        )
        
        # Create boolean flags for each allergen
        for allergen in allergens:
            col_name = f'contains_{allergen.replace(" ", "_")}'
            df[col_name] = df['allergy_list'].apply(
                lambda x: any(allergen in allergy.lower() for allergy in x)
            )
        
        print(f"Created {len(allergens)} allergen flags")
    
    # Step 7: Convert numeric columns to correct type
    print("\nStep 7: Converting numeric columns to correct types...")
    numeric_columns = ['energy_kcal', 'carb_g', 'protein_g', 'fat_g', 'free_sugar', 
                       'fiber_g', 'cholesterol_g', 'protein_calorie_ratio', 
                       'nutrient-score', 'health_score', 'diversity_score']
    
    for col in numeric_columns:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
    
    print("Numeric columns converted successfully")
    
    # Step 8: Normalize nutrients (optional)
    print("\nStep 8: Normalizing nutrients...")
    nutrients_to_normalize = ['protein_g', 'fat_g', 'carb_g']
    scaler = MinMaxScaler()
    
    for nutrient in nutrients_to_normalize:
        if nutrient in df.columns:
            normalized_col = f'{nutrient}_normalized'
            # Avoid division by zero or invalid values
            valid_mask = df[nutrient] > 0
            df[normalized_col] = 0.0
            if valid_mask.sum() > 0:
                df.loc[valid_mask, normalized_col] = scaler.fit_transform(
                    df.loc[valid_mask, [nutrient]]
                )
    
    print("Nutrients normalized (0-1 scale)")
    
    # Step 9: Precompute useful columns
    print("\nStep 9: Precomputing calorie breakdown columns...")
    
    # Calories per gram: Protein = 4, Carbs = 4, Fat = 9
    if 'protein_g' in df.columns:
        df['protein_kcal'] = df['protein_g'] * 4
    
    if 'fat_g' in df.columns:
        df['fat_kcal'] = df['fat_g'] * 9
    
    if 'carb_g' in df.columns:
        df['carb_kcal'] = df['carb_g'] * 4
    
    # Calculate macronutrient percentages
    if all(col in df.columns for col in ['protein_kcal', 'fat_kcal', 'carb_kcal', 'energy_kcal']):
        total_macro_kcal = df['protein_kcal'] + df['fat_kcal'] + df['carb_kcal']
        
        # Avoid division by zero
        df['protein_pct'] = np.where(
            total_macro_kcal > 0, 
            (df['protein_kcal'] / total_macro_kcal * 100).round(2), 
            0
        )
        df['fat_pct'] = np.where(
            total_macro_kcal > 0, 
            (df['fat_kcal'] / total_macro_kcal * 100).round(2), 
            0
        )
        df['carb_pct'] = np.where(
            total_macro_kcal > 0, 
            (df['carb_kcal'] / total_macro_kcal * 100).round(2), 
            0
        )
    
    print("Calorie breakdown computed: protein_kcal, fat_kcal, carb_kcal, and percentage columns")
    
    # Save preprocessed data
    print(f"\nSaving preprocessed data to {output_file}...")
    df.to_csv(output_file, index=False)
    import os
    full_path = os.path.abspath(output_file)
    print(f"✓ Successfully saved {len(df)} rows to:")
    print(f"  {full_path}")
    
    # Print summary statistics
    print("\n" + "="*60)
    print("PREPROCESSING SUMMARY")
    print("="*60)
    print(f"Total records: {len(df)}")
    print(f"Total columns: {len(df.columns)}")
    print(f"\nColumn names:\n{list(df.columns)}")
    print(f"\nData types:\n{df.dtypes}")
    print(f"\nBasic statistics:\n{df.describe()}")
    
    return df


if __name__ == "__main__":
    # Example usage
    input_csv = r"E:\DIET APP\backend\ML\datasets\InDiet_Dataset.csv"  # Replace with your actual file path
    
    try:
        preprocessed_df = preprocess_food_dataset(input_csv)
        print("\n✓ Preprocessing completed successfully!")
        
        # Display sample of processed data
        print("\nSample of preprocessed data:")
        print(preprocessed_df.head())
        
    except FileNotFoundError:
        print(f"Error: File '{input_csv}' not found. Please check the file path.")
    except Exception as e:
        print(f"Error during preprocessing: {str(e)}")
        raise