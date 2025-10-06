// backend/services/chatService.js
const { findFood } = require('./foodDatabase');

class ChatService {
  
  // Extract food items from user query
  extractFoodItems(query) {
    const normalizedQuery = query.toLowerCase();
    const { foodDatabase } = require('./foodDatabase');
    const foundFoods = [];
    
    // Check each food in database
    for (const foodName of Object.keys(foodDatabase)) {
      const regex = new RegExp(`\\b${foodName}\\b`, 'i');
      if (regex.test(normalizedQuery)) {
        foundFoods.push(foodName);
      }
    }
    
    // If no exact matches, try partial matching
    if (foundFoods.length === 0) {
      const words = normalizedQuery.split(/\s+/).filter(w => w.length > 3);
      for (const word of words) {
        const food = findFood(word);
        if (food && !foundFoods.includes(food.name)) {
          foundFoods.push(food.name);
        }
      }
    }
    
    return foundFoods;
  }

  // Check if food is allowed based on user's health profile
  checkFoodAllowance(foodData, userProfile) {
    const issues = [];
    const warnings = [];
    let isAllowed = true;

    // Check dietary restrictions
    if (userProfile.dietaryRestrictions) {
      if (userProfile.dietaryRestrictions.includes('vegetarian') && 
          ['lean protein', 'protein'].includes(foodData.category) && 
          ['chicken', 'fish', 'egg'].includes(foodData.category)) {
        issues.push('Not suitable for vegetarian diet');
        isAllowed = false;
      }
      
      if (userProfile.dietaryRestrictions.includes('vegan') && 
          ['dairy', 'dairy protein', 'protein'].includes(foodData.category)) {
        issues.push('Not suitable for vegan diet');
        isAllowed = false;
      }
      
      if (userProfile.dietaryRestrictions.includes('lactose intolerant') && 
          foodData.category === 'dairy') {
        issues.push('Contains lactose - not suitable for lactose intolerance');
        isAllowed = false;
      }
    }

    // Check health conditions
    if (userProfile.healthConditions) {
      // Diabetes
      if (userProfile.healthConditions.includes('diabetes')) {
        if (foodData.sugar && foodData.sugar > 15) {
          issues.push('High sugar content - not recommended for diabetes');
          isAllowed = false;
        } else if (foodData.sugar && foodData.sugar > 10) {
          warnings.push('Moderate sugar content - consume in limited quantities');
        }
        
        if (foodData.category === 'dessert') {
          issues.push('Desserts should be avoided with diabetes');
          isAllowed = false;
        }
      }

      // Hypertension
      if (userProfile.healthConditions.includes('hypertension')) {
        if (foodData.category === 'fried snack') {
          warnings.push('Fried foods may increase blood pressure - consume moderately');
        }
      }

      // High cholesterol
      if (userProfile.healthConditions.includes('high cholesterol')) {
        if (foodData.fat > 20) {
          warnings.push('High fat content - monitor your portion size');
        }
        if (foodData.category === 'fried snack') {
          issues.push('Fried foods not recommended for high cholesterol');
          isAllowed = false;
        }
      }

      // Heart disease
      if (userProfile.healthConditions.includes('heart disease')) {
        if (foodData.fat > 15 || foodData.category === 'fried snack') {
          issues.push('High fat content not suitable for heart disease');
          isAllowed = false;
        }
      }

      // Obesity/Weight loss goal
      if (userProfile.goals && userProfile.goals.includes('weight loss')) {
        if (foodData.calories > 300) {
          warnings.push('High calorie food - limit portion size for weight loss');
        }
        if (foodData.category === 'dessert' || foodData.category === 'fried snack') {
          issues.push('Not recommended for weight loss goals');
          isAllowed = false;
        }
      }
    }

    // Check daily calorie limits
    if (userProfile.dailyCalorieLimit && foodData.calories > userProfile.dailyCalorieLimit * 0.3) {
      warnings.push(`High calorie (${foodData.calories} cal) - this is more than 30% of your daily limit`);
    }

    return { isAllowed, issues, warnings };
  }

  // Generate intelligent response
  generateResponse(foodName, foodData, allowanceCheck, userProfile) {
    let response = '';

    if (allowanceCheck.isAllowed) {
      response = `✅ Yes, you can eat ${foodName}! `;
      
      // Add nutritional info
      response += `It contains ${foodData.calories} calories`;
      if (foodData.protein > 5) response += `, ${foodData.protein}g protein`;
      if (foodData.fiber > 3) response += `, ${foodData.fiber}g fiber`;
      response += '. ';

      // Add health benefits
      if (foodData.healthBenefits && foodData.healthBenefits.length > 0) {
        response += `Good for: ${foodData.healthBenefits.join(', ')}. `;
      }

      // Add warnings if any
      if (allowanceCheck.warnings.length > 0) {
        response += `\n\n⚠️ Note: ${allowanceCheck.warnings.join(' ')}`;
      }

      // Add portion advice
      if (foodData.category === 'dessert') {
        response += '\n\n💡 Tip: Enjoy in moderation as an occasional treat.';
      } else if (foodData.category === 'fruit' && foodData.sugar > 10) {
        response += '\n\n💡 Tip: Best consumed in morning or pre-workout.';
      } else if (foodData.category === 'nut') {
        response += '\n\n💡 Tip: A handful (20-30g) makes a great snack.';
      }

    } else {
      response = `❌ Sorry, ${foodName} is not recommended for you. `;
      response += allowanceCheck.issues.join(' ') + '. ';

      // Suggest alternatives
      response += '\n\n💡 Try these alternatives: ';
      const alternatives = this.suggestAlternatives(foodData, userProfile);
      response += alternatives.join(', ') + '.';
    }

    return response;
  }

  // Suggest healthy alternatives
  suggestAlternatives(foodData, userProfile) {
    const alternatives = [];
    const { foodDatabase } = require('./foodDatabase');

    if (foodData.category === 'dessert') {
      alternatives.push('fresh fruit', 'yogurt with honey', 'dates');
    } else if (foodData.category === 'fried snack') {
      alternatives.push('roasted chickpeas', 'baked chips', 'nuts');
    } else if (foodData.category === 'grain' && foodData.calories > 100) {
      alternatives.push('brown rice', 'oats', 'whole wheat roti');
    }

    // Filter alternatives based on user restrictions
    return alternatives.filter(alt => {
      const altFood = findFood(alt);
      if (!altFood) return true;
      const check = this.checkFoodAllowance(altFood.data, userProfile);
      return check.isAllowed;
    });
  }

  // Handle multiple food items in one query
  processMultipleFoods(foodItems, userProfile) {
    if (foodItems.length === 0) {
      return {
        isAllowed: null,
        response: "I couldn't identify any specific food in your query. Could you please mention a food item? For example: 'Can I eat carrot?' or 'I want pudding'."
      };
    }

    if (foodItems.length === 1) {
      const foodName = foodItems[0];
      const food = findFood(foodName);
      
      if (!food) {
        return {
          isAllowed: null,
          response: `I don't have information about "${foodName}" in my database yet. Please try another food item or consult your nutritionist.`
        };
      }

      const allowanceCheck = this.checkFoodAllowance(food.data, userProfile);
      const response = this.generateResponse(foodName, food.data, allowanceCheck, userProfile);

      return {
        isAllowed: allowanceCheck.isAllowed,
        response,
        foodItems: [foodName]
      };
    }

    // Multiple foods
    let response = `I found multiple foods in your query: ${foodItems.join(', ')}.\n\n`;
    let allAllowed = true;

    foodItems.forEach((foodName, index) => {
      const food = findFood(foodName);
      if (food) {
        const allowanceCheck = this.checkFoodAllowance(food.data, userProfile);
        const emoji = allowanceCheck.isAllowed ? '✅' : '❌';
        response += `${emoji} **${foodName}**: `;
        response += allowanceCheck.isAllowed ? 
          `Allowed (${food.data.calories} cal)` : 
          `Not recommended - ${allowanceCheck.issues[0]}`;
        response += '\n';
        if (!allowanceCheck.isAllowed) allAllowed = false;
      }
    });

    return {
      isAllowed: allAllowed,
      response,
      foodItems
    };
  }
}

module.exports = new ChatService();