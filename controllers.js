const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { execQuery, withTransaction } = require('./db');
const { 
  BOOKING_STATUS, 
  PAYMENT_TYPES, 
  CODE_TYPES, 
  CODE_SOURCES,
  pitchesData 
} = require('./models');
const { 
  logger, 
  generateDiscountCode, 
  generateVoucherCode,
  calculateTimeLeft,
  validateEmail,
  validatePhone,
  sanitizeInput,
  calculateRemainingWithVouchers
} = require('./utils');

// دوال المساعدة للتحكم
async function updateUserStats(userId, booking, action) {
  try {
    const users = await execQuery('SELECT stats FROM users WHERE id = $1', [userId]);
    if (users.length === 0) return;

    let stats = users[0].stats;
    if (typeof stats === 'string') {
      try {
        stats = JSON.parse(stats);
      } catch {
        stats = {};
      }
    }

    if (!stats || typeof stats !== 'object') {
      stats = {
        totalBookings: 0,
        successfulBookings: 0,
        cancelledBookings: 0,
        totalSpent: 0
      };
    }

    if (action === 'booking') {
      stats.totalBookings = (stats.totalBookings || 0) + 1;
    } else if (action === 'confirmation') {
      stats.successfulBookings = (stats.successfulBookings || 0) + 1;
      stats.totalSpent = (stats.totalSpent || 0) + (booking.final_amount || booking.amount || 0);
    } else if (action === 'cancellation') {
      stats.cancelledBookings = (stats.cancelledBookings || 0) + 1;
    }

    await execQuery('UPDATE users SET stats = $1 WHERE id = $2', [JSON.stringify(stats), userId]);
  } catch (error) {
    logger.error('Error updating user stats', { userId, error });
  }
}

// دالة إنشاء كود التعويض
async function generateCompensationCode(booking, type) {
  let compensationValue = 0;
  let message = '';

  if (type === 'full_refund') {
    compensationValue = Math.floor(booking.paid_amount * 0.8);
    message = 'كود تعويض عن إلغاء الحجز مع استرداد كامل المبلغ. صالح لمدة 14 يوم.';
  } else {
    compensationValue = Math.floor(booking.paid_amount * 0.5);
    message = 'كود تعويض عن إلغاء الحجز. صالح لمدة 14 يوم.';
  }

  const compensationCode = {
    id: uuidv4(),
    code: generateDiscountCode(10),
    value: compensationValue,
    type: CODE_TYPES.COMPENSATION,
    source: CODE_SOURCES.CANCELLATION,
    status: 'active',
    created_at: new Date(),
    expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    original_booking_id: booking.id,
    original_amount: booking.paid_amount,
    cancellation_type: type,
    message: message,
    user_id: booking.user_id
  };

  await execQuery(
    `INSERT INTO discount_codes (id, code, value, type, source, status, created_at, expires_at, 
     original_booking_id, original_amount, cancellation_type, message, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      compensationCode.id, compensationCode.code, compensationCode.value, compensationCode.type,
      compensationCode.source, compensationCode.status, compensationCode.created_at, compensationCode.expires_at,
      compensationCode.original_booking_id, compensationCode.original_amount, compensationCode.cancellation_type,
      compensationCode.message, compensationCode.user_id
    ]
  );

  return compensationCode;
}

// التحكم في الملاعب
const pitchController = {
  getAllPitches: async (req, res) => {
    try {
      res.json(pitchesData);
    } catch (error) {
      logger.error('Get pitches error', error);
      res.status(500).json({ message: 'خطأ في تحميل الملاعب' });
    }
  },

  getPitchById: async (req, res) => {
    try {
      const pitchId = parseInt(req.params.id);
      const pitch = pitchesData.find(p => p.id === pitchId);
      
      if (!pitch) {
        return res.status(404).json({ message: 'الملعب غير موجود' });
      }
      
      res.json(pitch);
    } catch (error) {
      logger.error('Get pitch error', error);
      res.status(500).json({ message: 'حدث خطأ في جلب بيانات الملعب' });
    }
  },

  getAvailableSlots: async (req, res) => {
    try {
      const pitchId = parseInt(req.params.id);
      const { date, period } = req.query;
      
      const pitch = pitchesData.find(p => p.id === pitchId);
      if (!pitch) {
        return res.status(404).json({ message: 'الملعب غير موجود' });
      }

      if (!date) {
        return res.status(400).json({ message: 'التاريخ مطلوب' });
      }

      // محاكاة بيانات الأوقات المتاحة
      const allSlots = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
      const availableSlots = allSlots.filter(() => Math.random() > 0.3);
      
      const availableSlotsWithIds = availableSlots.map(hour => ({
        id: `slot_${pitchId}_${date}_${hour}`,
        start_time: hour,
        end_time: hour + 1,
        players_needed: 0
      }));
      
      res.json({
        availableSlots: availableSlotsWithIds,
        availableCount: availableSlots.length,
        totalSlots: allSlots.length
      });

    } catch (error) {
      logger.error('Get available slots error', error);
      res.status(500).json({ message: 'حدث خطأ في جلب الأوقات المتاحة' });
    }
  }
};

// التحكم في الحجوزات
const bookingController = {
  createBooking: async (req, res) => {
    try {
      const { pitchId, date, time, name, phone, email, discountCode, userType } = req.body;
      
      if (!pitchId || !date || !time || !name || !phone) {
        return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
      }

      const pitch = pitchesData.find(p => p.id === parseInt(pitchId));
      if (!pitch) {
        return res.status(404).json({ message: 'الملعب غير موجود' });
      }

      // التحقق من التاريخ والوقت
      const selectedDate = new Date(date);
      const now = new Date();
      
      if (selectedDate < now) {
        return res.status(400).json({ message: 'لا يمكن الحجز في تاريخ ماضي' });
      }

      // التحقق من عدم وجود حجز مسبق
      const existingBookings = await execQuery(
        'SELECT id FROM bookings WHERE pitch_id = $1 AND date = $2 AND time = $3 AND status IN ($4, $5)',
        [pitchId, date, time, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.PENDING]
      );

      if (existingBookings.length > 0) {
        return res.status(400).json({ message: 'هذا الوقت محجوز بالفعل' });
      }

      // حساب المبالغ
      const depositAmount = calculateDeposit(pitch.price, `${date}T${time}`);
      let appliedDiscount = null;
      const amount = pitch.price;
      let discountValue = 0;

      // تطبيق كود الخصم إذا كان موجوداً
      if (discountCode) {
        const discountCodes = await execQuery(
          'SELECT * FROM discount_codes WHERE code = $1 AND status = $2',
          [discountCode.toUpperCase(), 'active']
        );

        if (discountCodes.length > 0) {
          const validCode = discountCodes[0];
          const discountOnRemaining = Math.min(validCode.value, pitch.price - depositAmount);
          discountValue = discountOnRemaining;
          appliedDiscount = {
            code: validCode.code,
            value: discountOnRemaining,
            originalPrice: pitch.price,
            finalPrice: pitch.price - discountOnRemaining
          };
        }
      }

      const finalAmount = Math.max(0, amount - discountValue);
      const remainingAmount = Math.max(0, finalAmount - depositAmount);

      const newBooking = {
        id: uuidv4(),
        pitch_id: parseInt(pitchId),
        pitch_name: pitch.name,
        pitch_location: pitch.location,
        pitch_price: pitch.price,
        deposit_amount: depositAmount,
        date,
        time,
        customer_name: sanitizeInput(name),
        customer_phone: sanitizeInput(phone),
        customer_email: sanitizeInput(email || req.session.user.email),
        user_id: req.session.user.id,
        user_type: userType || 'customer',
        status: BOOKING_STATUS.PENDING,
        amount: amount,
        paid_amount: 0,
        remaining_amount: remainingAmount,
        final_amount: finalAmount,
        applied_discount: appliedDiscount ? JSON.stringify(appliedDiscount) : null,
        discount_code: discountCode || null,
        payment_type: PAYMENT_TYPES.DEPOSIT,
        created_at: new Date(),
        updated_at: new Date(),
        payment_deadline: new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000).toISOString()
      };

      await execQuery(
        `INSERT INTO bookings (id, pitch_id, pitch_name, pitch_location, pitch_price, deposit_amount, date, time, 
         customer_name, customer_phone, customer_email, user_id, user_type, status, amount, paid_amount, 
         remaining_amount, final_amount, applied_discount, discount_code, payment_type, created_at, updated_at, payment_deadline)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)`,
        [
          newBooking.id, newBooking.pitch_id, newBooking.pitch_name, newBooking.pitch_location,
          newBooking.pitch_price, newBooking.deposit_amount, newBooking.date, newBooking.time,
          newBooking.customer_name, newBooking.customer_phone, newBooking.customer_email,
          newBooking.user_id, newBooking.user_type, newBooking.status, newBooking.amount,
          newBooking.paid_amount, newBooking.remaining_amount, newBooking.final_amount,
          newBooking.applied_discount, newBooking.discount_code, newBooking.payment_type,
          newBooking.created_at, newBooking.updated_at, newBooking.payment_deadline
        ]
      );

      // تحديث إحصائيات المستخدم
      await updateUserStats(req.session.user.id, newBooking, 'booking');

      // حفظ الحجز في الجلسة للدفع
      req.session.pendingBooking = newBooking;

      res.json({ 
        message: depositAmount === 0 
          ? 'تم إنشاء الحجز بنجاح. لا يوجد عربون مطلوب.'
          : 'تم إنشاء الحجز بنجاح. يرجى دفع العربون لتأكيد الحجز.',
        booking: newBooking,
        paymentRequired: depositAmount > 0,
        depositAmount: depositAmount,
        remainingAmount: remainingAmount
      });

    } catch (error) {
      logger.error('Booking error', error);
      res.status(500).json({ message: 'حدث خطأ أثناء الحجز' });
    }
  },

  cancelBooking: async (req, res) => {
    try {
      const bookingId = req.params.id;
      const { cancellationReason } = req.body;
      
      const bookings = await execQuery('SELECT * FROM bookings WHERE id = $1', [bookingId]);
      const booking = bookings[0];
      
      if (!booking) {
        return res.status(404).json({ message: 'الحجز غير موجود' });
      }

      const isOwner = booking.user_id === req.session.user.id;
      const isAdmin = req.session.user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'غير مسموح لك بإلغاء هذا الحجز' });
      }

      // حساب الوقت المتبقي للحجز
      const bookingDate = new Date(booking.date);
      const now = new Date();
      const timeDiff = bookingDate.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      let compensationCode = null;
      let refundAmount = 0;

      // تحديد سياسة الإلغاء
      if (hoursDiff > 48) {
        refundAmount = booking.paid_amount;
        compensationCode = await generateCompensationCode(booking, 'full_refund');
      } else if (hoursDiff > 24) {
        compensationCode = await generateCompensationCode(booking, 'partial_refund');
      }

      // تحديث حالة الحجز
      await execQuery(
        `UPDATE bookings SET status = $1, updated_at = $2, cancellation_time = $3, 
         cancellation_reason = $4, refund_amount = $5, compensation_code = $6 WHERE id = $7`,
        [BOOKING_STATUS.CANCELLED, new Date(), new Date(), cancellationReason, refundAmount, 
         compensationCode ? compensationCode.code : null, bookingId]
      );

      // تحديث إحصائيات المستخدم
      await updateUserStats(req.session.user.id, booking, 'cancellation');

      res.json({ 
        message: 'تم إلغاء الحجز بنجاح',
        refundAmount,
        compensationCode,
        policy: hoursDiff > 48 ? 'استرداد كامل + كود تعويض' : 
                hoursDiff > 24 ? 'كود تعويض فقط' : 'لا يوجد تعويض'
      });

    } catch (error) {
      logger.error('Cancel booking error', error);
      res.status(500).json({ message: 'حدث خطأ أثناء إلغاء الحجز' });
    }
  },

  getUserBookings: async (req, res) => {
    try {
      const bookings = await execQuery(
        'SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC',
        [req.session.user.id]
      );
      
      // في النظام الجديد، ندمج مع new_bookings
      const newBookings = await execQuery(
        'SELECT * FROM new_bookings WHERE customer_phone = $1 ORDER BY created_at DESC',
        [req.session.user.phone]
      );

      const allBookings = [...bookings, ...newBookings.map(b => ({
        id: b.id,
        pitch_name: 'ملعب - نظام جديد',
        date: b.created_at.split(' ')[0],
        time: '--',
        status: b.status,
        amount: b.total_amount,
        paid_amount: b.deposit_paid ? b.deposit_amount : 0,
        remaining_amount: b.remaining_amount
      }))];

      res.json(allBookings);
    } catch (error) {
      logger.error('Get user bookings error', error);
      res.status(500).json({ message: 'حدث خطأ في جلب الحجوزات' });
    }
  }
};

// التحكم في المصادقة
const authController = {
  signup: async (req, res) => {
    try {
      const { username, email, phone, password, role, nickname, age, bio, pitchIds } = req.body;
      
      if (!username || !email || !phone || !password || !role) {
        return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ message: 'البريد الإلكتروني غير صالح' });
      }

      if (!validatePhone(phone)) {
        return res.status(400).json({ message: 'رقم الهاتف غير صالح' });
      }

      // التحقق من التكرار
      const existingUsers = await execQuery(
        'SELECT id FROM users WHERE username = $1 OR email = $2 OR phone = $3 LIMIT 1',
        [username, email, phone]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'اسم المستخدم أو البريد أو الهاتف مستخدم بالفعل' });
      }

      const hash = await bcrypt.hash(password, 12);
      const verificationToken = uuidv4();
      const userId = uuidv4();

      const newUser = {
        id: userId,
        username: sanitizeInput(username),
        email: sanitizeInput(email),
        phone: sanitizeInput(phone),
        password: hash,
        role: role === 'admin' ? 'admin' : (role === 'manager' ? 'manager' : 'user'),
        approved: role === 'user' ? true : false,
        provider: 'local',
        email_verified: false,
        verification_token: verificationToken,
        created_at: new Date(),
        stats: JSON.stringify({
          totalBookings: 0,
          successfulBookings: 0,
          cancelledBookings: 0,
          totalSpent: 0
        })
      };

      await execQuery(
        `INSERT INTO users (id, username, email, phone, password, role, approved, provider, email_verified, verification_token, created_at, stats)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          newUser.id, newUser.username, newUser.email, newUser.phone, newUser.password,
          newUser.role, newUser.approved, newUser.provider, newUser.email_verified,
          newUser.verification_token, newUser.created_at, newUser.stats
        ]
      );

      // إنشاء الملف الشخصي
      await execQuery(
        `INSERT INTO user_profiles (user_id, nickname, age, bio, join_date, last_updated)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, nickname || username, age || null, bio || '', new Date(), new Date()]
      );

      res.json({ 
        message: role === 'manager' 
          ? 'تم إرسال طلب التسجيل كمدير بنجاح. سيتم مراجعته والموافقة عليه من قبل الإدارة.'
          : 'تم إنشاء الحساب بنجاح. يرجى فحص بريدك الإلكتروني للتفعيل.',
        success: true 
      });

    } catch (error) {
      logger.error('Signup error', error);
      res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الحساب' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'يرجى إدخال البريد وكلمة المرور' });
      }

      const users = await execQuery(
        'SELECT * FROM users WHERE email = $1 AND provider = $2',
        [email, 'local']
      );
      
      if (users.length === 0) {
        return res.status(401).json({ message: 'البريد أو كلمة المرور غير صحيحة' });
      }

      const user = users[0];
      const match = await bcrypt.compare(password, user.password);
      
      if (!match) {
        return res.status(401).json({ message: 'البريد أو كلمة المرور غير صحيحة' });
      }

      if (!user.email_verified) {
        return res.status(403).json({ message: 'لم يتم تفعيل البريد الإلكتروني بعد' });
      }

      if (!user.approved) {
        return res.status(403).json({ message: 'حسابك ينتظر الموافقة من الإدارة' });
      }

      // تحديث آخر دخول
      await execQuery(
        'UPDATE users SET last_login = $1 WHERE id = $2',
        [new Date(), user.id]
      );

      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role
      };

      res.json({ 
        message: 'تم تسجيل الدخول بنجاح',
        user: req.session.user
      });

    } catch (error) {
      logger.error('Login error', error);
      res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الدخول' });
    }
  },

  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        logger.error('Logout error', err);
        return res.status(500).json({ message: 'خطأ في تسجيل الخروج' });
      }
      res.json({ message: 'تم تسجيل الخروج' });
    });
  }
};

module.exports = {
  pitchController,
  bookingController,
  authController,
  updateUserStats,
  generateCompensationCode
};
