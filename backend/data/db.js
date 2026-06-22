// هاد الملف بحتفظ فيه بالداتا كلها
// استخدمنا JSON بدل قاعدة بيانات لأن المشروع بسيط وما احتاجنا نعقّد الأمور

const bcrypt = require('bcryptjs')

// مستخدمين جاهزين للتجربة
// كلمات المرور محوّلة لـ hash عشان ما تكون مكشوفة
const users = [
  {
    id: '1',
    name: 'Admin JUST',
    email: 'admin@just.edu.jo',
    // admin123
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin'
  },
  {
    id: '2',
    name: 'Student Test',
    email: 'student@just.edu.jo',
    // student123
    password: bcrypt.hashSync('student123', 10),
    role: 'student'
  }
]

// مصفوفة التذاكر - بتبدأ فاضية وبتتملى لما الطلاب يرفعون تذاكر
const tickets = []

module.exports = { users, tickets }
