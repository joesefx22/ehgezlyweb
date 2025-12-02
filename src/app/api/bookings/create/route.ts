await sendMail(user.email, "تم إنشاء حجز جديد", `
  <h2>تم الحجز بنجاح</h2>
  <p>رقم الحجز: ${booking.id}</p>
`);
