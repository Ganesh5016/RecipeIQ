export const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({ success: true, ...data });
};

export const sendError = (res, message, statusCode = 400) => {
  res.status(statusCode).json({ success: false, error: message });
};

export const paginate = (page = 1, limit = 12) => ({
  skip: (Number(page) - 1) * Number(limit),
  limit: Number(limit),
});

export const buildMeta = (total, page, limit) => ({
  total,
  page: Number(page),
  limit: Number(limit),
  pages: Math.ceil(total / Number(limit)),
  hasNext: Number(page) < Math.ceil(total / Number(limit)),
  hasPrev: Number(page) > 1,
});
