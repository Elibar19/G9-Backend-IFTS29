// Runs when no route matched what the user requested.
function notFound(req, res) {
  const isApiRoute = req.originalUrl.startsWith('/api');

  if (isApiRoute) {
    return res.status(404).json({
      success: false,
      message: `No se encontró la ruta ${req.method} ${req.originalUrl}`,
    });
  }

  res.status(404).render('error', {
    title: 'Error',
    statusCode: 404,
    message: 'Página no encontrada',
  });
}

module.exports = notFound;
