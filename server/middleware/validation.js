import Joi from 'joi';

export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message);
    return res.status(400).json({ error: messages.join(', ') });
  }
  next();
};

export const schemas = {
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50),
    dietPreference: Joi.string().valid('none','vegetarian','vegan','keto','paleo','gluten-free','diabetic'),
    allergies: Joi.array().items(Joi.string()),
    favoriteCuisine: Joi.array().items(Joi.string()),
    fitnessGoal: Joi.string().valid('none','weight-loss','weight-gain','muscle-gain','maintenance'),
    skillLevel: Joi.string().valid('beginner','intermediate','advanced'),
    calorieGoal: Joi.number().min(500).max(10000),
    avatar: Joi.string().uri().allow(''),
  }),

  generateRecipe: Joi.object({
    ingredients: Joi.array().items(Joi.string()).min(1).required(),
    cuisine: Joi.string().allow(''),
    dietType: Joi.string().allow(''),
    allergies: Joi.array().items(Joi.string()),
    cookingTime: Joi.number().min(5).max(480),
    calories: Joi.number().min(100).max(5000),
    skillLevel: Joi.string().valid('beginner','intermediate','advanced'),
    servings: Joi.number().min(1).max(20),
    language: Joi.string().valid('en', 'hi', 'te', 'ta').allow(''),
  }),

  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().max(500).allow(''),
  }),

  mealPlan: Joi.object({
    title: Joi.string().required(),
    planType: Joi.string().valid('daily','weekly','monthly').required(),
    goal: Joi.string().required(),
    startDate: Joi.date().required(),
  }),

  chatMessage: Joi.object({
    message: Joi.string().min(1).max(1000).required(),
    sessionId: Joi.string().required(),
  }),
};
