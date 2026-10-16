// Ejecuta un controlador asincrónico y pasa cualquier error al errorHandler de Express.
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
