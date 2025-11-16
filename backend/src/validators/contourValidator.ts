import Joi from 'joi';

export const extractContourSchema = Joi.object({
  imageData: Joi.string().required().messages({
    'string.empty': 'Image data (URL or base64) is required',
    'any.required': 'Image data (URL or base64) is required',
  }),
});

export const validateExtractContour = (req: any, res: any, next: any) => {
  const { error } = extractContourSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
