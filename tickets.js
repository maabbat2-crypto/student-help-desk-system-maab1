// راوتس التذاكر - هاد القلب الأساسي للمشروع
// الطالب يرفع تذكرة والأدمن يردّ عليها

const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const { tickets } = require('../data/db')
const verifyToken = require('../middleware/auth')

// دالة بسيطة لتصنيف التذاكر بناءً على الكلمات الموجودة فيها
// هاد الـ feature الذكي البسيط اللي ذكرناه بالـ README
const classifyTicket = (title, description) => {
  const text = (title + ' ' + description).toLowerCase()

  if (text.includes('login') || text.includes('password') || text.includes('account') ||
      text.includes('دخول') || text.includes('كلمة مرور') || text.includes('حساب')) {
    return 'مشكلة تسجيل دخول'
  }

  if (text.includes('grade') || text.includes('exam') || text.includes('course') ||
      text.includes('علامة') || text.includes('امتحان') || text.includes('مادة')) {
    return 'شؤون أكاديمية'
  }

  if (text.includes('fee') || text.includes('payment') || text.includes('tuition') ||
      text.includes('رسوم') || text.includes('دفع') || text.includes('مصاريف')) {
    return 'شؤون مالية'
  }

  if (text.includes('wifi') || text.includes('internet') || text.includes('network') ||
      text.includes('انترنت') || text.includes('شبكة') || text.includes('واي فاي')) {
    return 'مشكلة تقنية'
  }

  // لو ما لاقى كلمة معروفة، يحطه عام
  return 'عام'
}

// GET /api/tickets
// جلب التذاكر - الأدمن يشوف الكل، الطالب يشوف تذاكره بس
router.get('/', verifyToken, (req, res) => {
  if (req.user.role === 'admin') {
    // الأدمن يشوف كل التذاكر مرتبة من الأحدث للأقدم
    return res.json(tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
  }

  // الطالب يشوف تذاكره بس
  const myTickets = tickets
    .filter(t => t.studentId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  res.json(myTickets)
})

// GET /api/tickets/:id
// جلب تفاصيل تذكرة معينة
router.get('/:id', verifyToken, (req, res) => {
  const ticket = tickets.find(t => t.id === req.params.id)

  if (!ticket) {
    return res.status(404).json({ message: 'التذكرة مش موجودة' })
  }

  // الطالب يقدر يشوف تذاكره بس، الأدمن يشوف الكل
  if (req.user.role !== 'admin' && ticket.studentId !== req.user.id) {
    return res.status(403).json({ message: 'مش مسموح لك تشوف هاي التذكرة' })
  }

  res.json(ticket)
})

// POST /api/tickets
// رفع تذكرة جديدة - الطلاب بس
router.post('/', verifyToken, (req, res) => {
  // الأدمن ما يرفع تذاكر
  if (req.user.role === 'admin') {
    return res.status(403).json({ message: 'الأدمن ما يرفع تذاكر' })
  }

  const { title, description } = req.body

  if (!title || !description) {
    return res.status(400).json({ message: 'العنوان والوصف مطلوبين' })
  }

  // بصنّف التذكرة تلقائياً
  const category = classifyTicket(title, description)

  const newTicket = {
    id: uuidv4(),
    title,
    description,
    category,           // التصنيف التلقائي
    status: 'open',     // كل تذكرة جديدة بتكون مفتوحة
    studentId: req.user.id,
    studentName: req.user.name,
    studentEmail: req.user.email,
    adminReply: null,   // ما في رد بعد
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  tickets.push(newTicket)

  res.status(201).json({
    message: 'تم رفع التذكرة بنجاح',
    ticket: newTicket
  })
})

// PUT /api/tickets/:id/reply
// رد الأدمن على التذكرة وتغيير حالتها
router.put('/:id/reply', verifyToken, (req, res) => {
  // هاد الراوت للأدمن بس
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'هاد الإجراء للأدمن بس' })
  }

  const ticket = tickets.find(t => t.id === req.params.id)

  if (!ticket) {
    return res.status(404).json({ message: 'التذكرة مش موجودة' })
  }

  const { reply, status } = req.body

  if (!reply) {
    return res.status(400).json({ message: 'لازم تكتب رد' })
  }

  // بحدّث التذكرة بالرد والحالة الجديدة
  ticket.adminReply = reply
  ticket.status = status || 'in-progress' // لو ما حدّد حالة، يحطها قيد المعالجة
  ticket.updatedAt = new Date().toISOString()

  res.json({
    message: 'تم الرد على التذكرة',
    ticket
  })
})

// PUT /api/tickets/:id/status
// تغيير حالة التذكرة - أدمن بس
router.put('/:id/status', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'هاد الإجراء للأدمن بس' })
  }

  const ticket = tickets.find(t => t.id === req.params.id)

  if (!ticket) {
    return res.status(404).json({ message: 'التذكرة مش موجودة' })
  }

  const { status } = req.body

  // الحالات المسموحة للتذاكر
  const validStatuses = ['open', 'in-progress', 'closed']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'الحالة غلط، لازم تكون: open أو in-progress أو closed' })
  }

  ticket.status = status
  ticket.updatedAt = new Date().toISOString()

  res.json({
    message: 'تم تحديث حالة التذكرة',
    ticket
  })
})

module.exports = router
