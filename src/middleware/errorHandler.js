// Safety net: if something unexpected breaks in any route,
// Express calls this function instead of crashing the server.
function errorHandler(err, req, res, next) {
  console.error(err);

  const isApiRoute = req.originalUrl.startsWith('/api');

  if (isApiRoute) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }

  res.status(500).render('error', {
    title: 'Error',
    statusCode: 500,
    message: 'Ocurrió un error inesperado en el servidor',
  });
}

export default errorHandler;
