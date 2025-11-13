import Joi from 'joi';

export const createCreatureSchema = Joi.object({
  imageData: Joi.string().required().messages({
    'string.empty': 'Image data is required',
    'any.required': 'Image data is required',
  }),
  userCustomization: Joi.object({
    name: Joi.string().min(1).max(50).optional(),
    species: Joi.string().min(1).max(50).optional(),
    personality: Joi.array().items(Joi.string().max(20)).max(6).optional(),
    habitat: Joi.string().min(1).max(200).optional(),
    story: Joi.string().min(0).max(1000).allow('').optional(),
    emotionValue: Joi.number().min(0).max(100).optional(),
  }).optional(),
});

export const updateCreatureSchema = Joi.object({
  name: Joi.string().min(1).max(50).optional(),
  backstory: Joi.string().min(0).max(1000).allow('').optional(),
  emotionValue: Joi.number().min(0).max(100).optional(),
}).min(1);

export const validateCreateCreature = (req: any, res: any, next: any) => {
  const { error } = createCreatureSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateUpdateCreature = (req: any, res: any, next: any) => {
  const { error } = updateCreatureSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
