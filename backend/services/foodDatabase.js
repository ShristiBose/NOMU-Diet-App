// backend/services/foodDatabase.js
// Comprehensive Indian food database with nutritional info

const foodDatabase = {
  // Vegetables
  carrot: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, category: 'vegetable', healthBenefits: ['eye health', 'immunity'] },
  potato: { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, category: 'starchy vegetable', healthBenefits: ['energy'] },
  spinach: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, category: 'leafy green', healthBenefits: ['iron', 'immunity'] },
  tomato: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, category: 'vegetable', healthBenefits: ['heart health', 'antioxidants'] },
  broccoli: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, category: 'vegetable', healthBenefits: ['immunity', 'bone health'] },
  cauliflower: { calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2, category: 'vegetable', healthBenefits: ['digestion'] },
  
  // Fruits
  apple: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, category: 'fruit', sugar: 10.4, healthBenefits: ['heart health', 'weight management'] },
  banana: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, category: 'fruit', sugar: 12, healthBenefits: ['energy', 'potassium'] },
  mango: { calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, category: 'fruit', sugar: 13.7, healthBenefits: ['vitamin C', 'immunity'] },
  orange: { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, category: 'fruit', sugar: 9, healthBenefits: ['vitamin C', 'immunity'] },
  
  // Grains & Staples
  rice: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, category: 'grain', healthBenefits: ['energy'] },
  'brown rice': { calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, category: 'whole grain', healthBenefits: ['energy', 'fiber'] },
  roti: { calories: 71, protein: 3, carbs: 15, fat: 0.4, fiber: 2, category: 'grain', healthBenefits: ['energy', 'fiber'] },
  chapati: { calories: 71, protein: 3, carbs: 15, fat: 0.4, fiber: 2, category: 'grain', healthBenefits: ['energy', 'fiber'] },
  bread: { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, category: 'grain', healthBenefits: ['energy'] },
  oats: { calories: 389, protein: 16.9, carbs: 66, fat: 6.9, fiber: 10.6, category: 'whole grain', healthBenefits: ['heart health', 'cholesterol'] },
  
  // Proteins
  chicken: { calories: 239, protein: 27, carbs: 0, fat: 14, fiber: 0, category: 'lean protein', healthBenefits: ['muscle building', 'protein'] },
  fish: { calories: 206, protein: 22, carbs: 0, fat: 12, fiber: 0, category: 'lean protein', healthBenefits: ['omega-3', 'heart health'] },
  egg: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, category: 'protein', healthBenefits: ['protein', 'vitamin D'] },
  paneer: { calories: 265, protein: 18, carbs: 1.2, fat: 20, fiber: 0, category: 'dairy protein', healthBenefits: ['calcium', 'protein'] },
  tofu: { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, category: 'plant protein', healthBenefits: ['protein', 'vegan'] },
  
  // Legumes
  dal: { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8, category: 'legume', healthBenefits: ['protein', 'fiber'] },
  lentils: { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8, category: 'legume', healthBenefits: ['protein', 'fiber'] },
  chickpeas: { calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 7.6, category: 'legume', healthBenefits: ['protein', 'fiber'] },
  'kidney beans': { calories: 127, protein: 8.7, carbs: 23, fat: 0.5, fiber: 6.4, category: 'legume', healthBenefits: ['protein', 'fiber'] },
  
  // Dairy
  milk: { calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0, category: 'dairy', healthBenefits: ['calcium', 'vitamin D'] },
  yogurt: { calories: 59, protein: 3.5, carbs: 3.6, fat: 3.3, fiber: 0, category: 'dairy', healthBenefits: ['probiotics', 'calcium'] },
  curd: { calories: 59, protein: 3.5, carbs: 3.6, fat: 3.3, fiber: 0, category: 'dairy', healthBenefits: ['probiotics', 'digestion'] },
  cheese: { calories: 402, protein: 25, carbs: 1.3, fat: 33, fiber: 0, category: 'dairy', healthBenefits: ['calcium', 'protein'] },
  
  // Sweets & Desserts
  pudding: { calories: 158, protein: 4, carbs: 22, fat: 5.5, fiber: 0, category: 'dessert', sugar: 17, healthBenefits: [] },
  'gulab jamun': { calories: 175, protein: 3, carbs: 25, fat: 8, fiber: 0.5, category: 'dessert', sugar: 20, healthBenefits: [] },
  'ice cream': { calories: 207, protein: 3.5, carbs: 24, fat: 11, fiber: 0.7, category: 'dessert', sugar: 21, healthBenefits: [] },
  'chocolate': { calories: 546, protein: 4.9, carbs: 61, fat: 31, fiber: 7, category: 'dessert', sugar: 48, healthBenefits: [] },
  jalebi: { calories: 150, protein: 1, carbs: 28, fat: 4, fiber: 0, category: 'dessert', sugar: 22, healthBenefits: [] },
  
  // Snacks
  samosa: { calories: 262, protein: 3.5, carbs: 24, fat: 17, fiber: 2, category: 'fried snack', healthBenefits: [] },
  pakora: { calories: 255, protein: 5, carbs: 22, fat: 16, fiber: 2.5, category: 'fried snack', healthBenefits: [] },
  'french fries': { calories: 312, protein: 3.4, carbs: 41, fat: 15, fiber: 3.8, category: 'fried snack', healthBenefits: [] },
  chips: { calories: 536, protein: 6.6, carbs: 53, fat: 34, fiber: 4.5, category: 'fried snack', healthBenefits: [] },
  
  // Beverages
  'green tea': { calories: 2, protein: 0, carbs: 0, fat: 0, fiber: 0, category: 'beverage', healthBenefits: ['antioxidants', 'metabolism'] },
  coffee: { calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0, category: 'beverage', healthBenefits: ['alertness'] },
  'fruit juice': { calories: 45, protein: 0.5, carbs: 11, fat: 0.1, fiber: 0.2, category: 'beverage', sugar: 9, healthBenefits: ['vitamins'] },
  
  // Nuts & Seeds
  almonds: { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5, category: 'nut', healthBenefits: ['heart health', 'vitamin E'] },
  walnuts: { calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7, category: 'nut', healthBenefits: ['omega-3', 'brain health'] },
  peanuts: { calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 8.5, category: 'nut', healthBenefits: ['protein', 'energy'] }
};

// Function to search for food items (handles plurals and variations)
function findFood(query) {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Direct match
  if (foodDatabase[normalizedQuery]) {
    return { name: normalizedQuery, data: foodDatabase[normalizedQuery] };
  }
  
  // Try singular form
  if (normalizedQuery.endsWith('s')) {
    const singular = normalizedQuery.slice(0, -1);
    if (foodDatabase[singular]) {
      return { name: singular, data: foodDatabase[singular] };
    }
  }
  
  // Partial match
  for (const [foodName, foodData] of Object.entries(foodDatabase)) {
    if (foodName.includes(normalizedQuery) || normalizedQuery.includes(foodName)) {
      return { name: foodName, data: foodData };
    }
  }
  
  return null;
}

module.exports = { foodDatabase, findFood };