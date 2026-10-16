// Exige que el usuario este logueado para ver el panel (la API REST no se protege).
export function requireLogin(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  return res.redirect('/login');
}

// Exige un rol determinado: sin login redirige a /login, con login y rol incorrecto responde 403.
export function requireRole(role) {
  return (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      if (req.user.role === role) {
        return next();
      }

      return res.status(403).render('error', {
        title: 'Error',
        statusCode: 403,
        message: 'Tu rol no tiene permisos para realizar esta acción',
      });
    }

    return res.redirect('/login');
  };
}

// Pone el usuario logueado a disposicion de todas las vistas (layout.pug).
export function attachUserView(req, res, next) {
  res.locals.currentUser = req.user || null;
  next();
}
