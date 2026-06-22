// هاد الـ middleware بتحقق إذا المستخدم عنده توكن صحيح
// بحطه قبل أي راوت بدي أحميه من الناس اللي ما سجّلوا دخول

const jwt = require('jsonwebtoken')

// المفتاح السري للتوكن - بالمشروع الحقيقي لازم يكون في .env
const SECRET = 'just_helpdesk_secret_2024'

const verifyToken = (req, res, next) => {
  // بجيب التوكن من الهيدر
  const authHeader = req.headers['authorization']

  // إذا ما في توكن بالهيدر، ما بكمل
  if (!authHeader) {
    return res.status(401).json({ message: 'لازم تسجّل دخول أول' })
  }

  // التوكن بيجي بهالشكل: "Bearer eyJ..."
  // بقسّمه وباخد الجزء الثاني بس
  const token = authHeader.split(' ')[1]

  try {
    // بتحقق إذا التوكن صحيح وما انتهت صلاحيته
    const decoded = jwt.verify(token, SECRET)

    // بحفظ بيانات المستخدم في الـ request عشان أستخدمها لاحقاً
    req.user = decoded
    next()
  } catch (err) {
    // إذا التوكن غلط أو انتهى
    return res.status(403).json({ message: 'التوكن غلط أو انتهت صلاحيته، سجّل دخول مرة ثانية' })
  }
}

module.exports = verifyToken
