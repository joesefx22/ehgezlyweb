const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const config = require('./config');

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: 'عدد الطلبات كبير جداً، حاول مرة أخرى لاحقاً' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'محاولات تسجيل دخول كثيرة، حاول لاحقًا' }
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'محاولات كثيرة لعمليات الدفع، حاول لاحقًا' }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'عدد طلبات API كبير جداً' }
});

// CSRF Protection
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'none' : 'lax'
  }
});

// Middlewares للمصادقة
function requireLogin(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.status(401).json({ message: 'يجب تسجيل الدخول' });
}

function requireAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'مسموح للمدير فقط' });
}

function requireManager(req, res, next) {
  if (req.session.user && (req.session.user.role === 'manager' || req.session.user.role === 'admin')) {
    return next();
  }
  res.status(403).json({ message: 'مسموح للمديرين فقط' });
}

module.exports = {
  globalLimiter,
  loginLimiter,
  paymentLimiter,
  apiLimiter,
  csrfProtection,
  requireLogin,
  requireAdmin,
  requireManager
};
