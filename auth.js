// راوتس التسجيل وتسجيل الدخول
// عندي راوتين بس: واحد للتسجيل وواحد للدخول

const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const { users } = require('../data/db')

const SECRET = 'just_helpdesk_secret_2024'

// POST /api/auth/register
// تسجيل مستخدم جديد - الطلاب بس يقدروا يسجلوا حسابات جديدة
router.post('/register', (req, res) => {
  const { name, email, password } = req.body

  // تحقق إذا كل الحقول موجودة
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'كل الحقول مطلوبة' })
  }

  // بتحقق إذا الإيميل مسجّل أصلاً
  const existingUser = users.find(u => u.email === email)
  if (existingUser) {
    return res.status(400).json({ message: 'هاد الإيميل مسجّل مسبقاً' })
  }

  // بحوّل كلمة المرور لـ hash عشان ما تتخزن كنص عادي
  const hashedPassword = bcrypt.hashSync(password, 10)

  // بضيف المستخدم الجديد للقائمة
  const newUser = {
    id: uuidv4(),
    name,
    email,
    password: hashedPassword,
    role: 'student' // كل حساب جديد بيكون طالب تلقائياً
  }

  users.push(newUser)

  res.status(201).json({ message: 'تم التسجيل بنجاح' })
})

// POST /api/auth/login
// تسجيل الدخول للطلاب والأدمن
router.post('/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'الإيميل وكلمة المرور مطلوبين' })
  }

  // بدور على المستخدم بالإيميل
  const user = users.find(u => u.email === email)
  if (!user) {
    return res.status(401).json({ message: 'الإيميل أو كلمة المرور غلط' })
  }

  // بقارن كلمة المرور المدخولة مع الـ hash المحفوظ
  const isMatch = bcrypt.compareSync(password, user.password)
  if (!isMatch) {
    return res.status(401).json({ message: 'الإيميل أو كلمة المرور غلط' })
  }

  // بعمل توكن فيه بيانات المستخدم وصلاحيته يوم كامل
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    SECRET,
    { expiresIn: '1d' }
  )

  res.json({
    message: 'تم تسجيل الدخول بنجاح',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  })
})

module.exports = router
