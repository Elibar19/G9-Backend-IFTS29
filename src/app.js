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

app.disable('x-powered-by'); // no revelar la version de Express en los headers
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));

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
