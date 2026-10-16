import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import passport from './config/passport.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import { attachUserView } from './middleware/requireAuth.js';
import { sessionSecret } from './config.js';
import routes from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use(
  session({
    name: 'agrotec.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(attachUserView);

app.use('/', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
