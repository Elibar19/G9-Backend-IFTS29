import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import Usuario from '../models/Usuario.js';

// Comparacion plana de contraseñas por ahora.
// TODO: cuando agreguemos hashing, cambiar solo esta funcion a bcrypt.compare(plain, stored)
// y adaptar el seed; el resto del login no se toca.
function checkPassword(plain, stored) {
  return plain === stored;
}

passport.use(
  new LocalStrategy(
    { usernameField: 'usuario', passwordField: 'password' },
    async (usuario, password, done) => {
      const user = await Usuario.findOne({ usuario }).lean();

      if (!user || !checkPassword(password, user.password)) {
        return done(null, false, { message: 'Usuario o contraseña incorrectos' });
      }

      const safeUser = { ...user };
      delete safeUser.password;
      return done(null, safeUser);
    }
  )
);

passport.serializeUser((user, done) => done(null, user._id));

passport.deserializeUser(async (id, done) => {
  const user = await Usuario.findById(id).select('-password').lean();
  done(null, user || false);
});

export default passport;
