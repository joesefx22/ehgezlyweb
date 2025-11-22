require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  appUrl: process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`,
  isProduction: process.env.NODE_ENV === 'production',
  
  // إعدادات البريد
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@ehgzly.com'
  },
  
  // إعدادات OAuth
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  },
  
  // إعدادات الجلسة
  session: {
    secret: process.env.SESSION_SECRET || 'change-this-in-production-' + Date.now(),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
  },
  
  // إعدادات الدفع
  payment: {
    vodafone: { name: 'Vodafone Cash', number: process.env.VODAFONE_NUMBER || '01012345678', icon: '/icons/vodafone.png' },
    orange: { name: 'Orange Cash', number: process.env.ORANGE_NUMBER || '01287654321', icon: '/icons/orange.png' },
    etisalat: { name: 'Etisalat Cash', number: process.env.ETISALAT_NUMBER || '01155556666', icon: '/icons/etisalat.png' },
    instapay: { name: 'InstaPay', number: process.env.INSTAPAY_NUMBER || 'yourname@instapay', icon: '/icons/instapay.png' }
  },
  
  // CORS
  cors: {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true,
    credentials: true
  }
};

module.exports = config;
