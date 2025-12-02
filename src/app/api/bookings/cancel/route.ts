await sendMail(user.email, "تم إلغاء الحجز", `
  <p>تم إلغاء الحجز رقم: ${booking.id}</p>
`);
