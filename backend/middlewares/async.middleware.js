// Async Handler Middleware
// Eliminates the need for try-catch blocks in async controller functions
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler; 