// هاد الملف هو نقطة البداية للسيرفر
// بشغّل التطبيق على البورت 5000

const express = require('express')
const cors = require('cors')
const path = require('path')

// استدعاء الراوتس اللي عملتها
const authRoutes = require('./routes/auth')
const ticketRoutes = require('./routes/tickets')

const app = express()
const PORT = process.env.PORT || 5000

// بسمح للفرونت إنه يتواصل مع الباك بدون مشاكل
app.use(cors())

// عشان أقدر أقرأ الـ JSON اللي بيجي من الطلبات
app.use(express.json())

// الراوتس الخاصة بتسجيل الدخول والتسجيل
app.use('/api/auth', authRoutes)

// الراوتس الخاصة بالتذاكر
app.use('/api/tickets', ticketRoutes)

// بخدم الفرونت اند من مجلد public
app.use(express.static(path.join(__dirname, 'public')))

// أي رابط ثاني بوجّهه للصفحة الرئيسية
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// بشغّل السيرفر وبطبع رسالة إنه شغّال
app.listen(PORT, () => {
  console.log(`السيرفر شغّال على البورت ${PORT}`)
})
