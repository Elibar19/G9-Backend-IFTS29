import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import passport from './config/passport.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import { attachUserView } from './middleware/requireAuth.js';
import { sessionSecret, isProduction } from './config.js';
import routes from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));

// En producción (Render) la app recibe el request detrás de un proxy:
// sin trust proxy, express-session ve http y descarta la cookie secure.
if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use(
  session({
    name: 'agrotec.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    // Sesiones en MongoDB: sobreviven reinicios del servicio (requisito de Render).
    // connect-mongo v6 no acepta mongooseConnection: se reutiliza el client del driver.
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
      dbName: mongoose.connection.name,
      collectionName: 'sessions',
      stringify: false,
    }),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 24 * 60 * 60 * 1000, // 24 h
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(attachUserView);

app.use('/', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
