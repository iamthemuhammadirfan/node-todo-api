const logger = require("../config/logger");

const apiLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  logger.info(`API Request - ${req.method} ${req.originalUrl}`);
  if (Object.keys(req.body).length > 0) {
    logger.info(`Request Body: ${JSON.stringify(req.body)}`);
  }

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function (body) {
    const duration = Date.now() - start;

    logger.info(
      `API Response - ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms`
    );

    if (res.statusCode >= 400) {
      logger.error(`Error Response: ${JSON.stringify(body)}`);
    }

    return originalJson.call(this, body);
  };

  next();
};

module.exports = apiLogger;
