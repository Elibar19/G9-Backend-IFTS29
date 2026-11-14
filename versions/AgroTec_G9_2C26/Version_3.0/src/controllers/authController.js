export function showLogin(req, res) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.redirect('/');
  }

  res.render('login', {
    title: 'Iniciar sesión',
    message: req.query.error ? 'Usuario o contraseña incorrectos' : null,
  });
}

export function logout(req, res, next) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    req.session.destroy(() => {
      res.clearCookie('agrotec.sid');
      res.redirect('/login');
    });
  });
}
