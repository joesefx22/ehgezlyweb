const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

// نظام التسجيل
const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, meta);
  },
  error: (message, error = null) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error);
  },
  warn: (message, meta = {}) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, meta);
  }
};

// دوال مساعدة
function generateDiscountCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateVoucherCode(prefix = 'VC') {
  return prefix + '-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function calculateTimeLeft(countdownEnd) {
  const now = new Date();
  const end = new Date(countdownEnd);
  const diff = end - now;
  
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds };
}

function calculateDeposit(pitchPrice, bookingDate) {
  const now = new Date();
  const bookingDateTime = new Date(bookingDate);
  const timeDiff = bookingDateTime.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  if (hoursDiff < 24) {
    return 0;
  }
  
  if (hoursDiff < 48) {
    return Math.floor(pitchPrice * 0.5);
  }
  
  return Math.floor(pitchPrice * 0.3);
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  const egyptPhoneRegex = /^(?:\+20|0)?1[0125]\d{8}$/;
  return egyptPhoneRegex.test(phone);
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
}

// حساب المبلغ المتبقي مع الأكواد
function calculateRemainingWithVouchers(totalAmount, depositAmount, voucherValues = []) {
  const totalVoucherValue = voucherValues.reduce((sum, value) => sum + value, 0);
  
  if (totalVoucherValue > depositAmount) {
    return Math.max(0, totalAmount - totalVoucherValue);
  } else {
    return Math.max(0, totalAmount - depositAmount);
  }
}

// إنشاء مجلد uploads
function ensureUploadsDir() {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}

module.exports = {
  logger,
  generateDiscountCode,
  generateVoucherCode,
  calculateTimeLeft,
  calculateDeposit,
  validateEmail,
  validatePhone,
  sanitizeInput,
  calculateRemainingWithVouchers,
  ensureUploadsDir
};
