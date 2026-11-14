import express from 'express';
import passport from 'passport';
import { showLogin, logout } from '../controllers/authController.js';

const router = express.Router();

router.get('/login', showLogin);
router.post('/login', passport.authenticate('local', {
  successReturnToOrRedirect: '/',
  failureRedirect: '/login?error=1',
}));
router.post('/logout', logout);

export default router;
