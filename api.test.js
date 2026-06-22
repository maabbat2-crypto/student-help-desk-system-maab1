// تيستات بسيطة للتأكد إن الـ API شغّال صح
// هاي التيستات بتشتغل في الـ CI/CD pipeline

const request = require('supertest')
const express = require('express')
const cors = require('cors')

// بعمل سيرفر تيست منفصل عشان ما أتعارض مع السيرفر الحقيقي
const authRoutes = require('../routes/auth')
const ticketRoutes = require('../routes/tickets')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/tickets', ticketRoutes)

// بخزّن التوكن هون عشان أستخدمه في التيستات
let studentToken = ''
let adminToken = ''

// تيست تسجيل الدخول
describe('Auth Tests', () => {

  test('الأدمن يقدر يسجّل دخول بالبيانات الصحيحة', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@just.edu.jo', password: 'admin123' })

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(res.body.user.role).toBe('admin')
    adminToken = res.body.token
  })

  test('الطالب يقدر يسجّل دخول بالبيانات الصحيحة', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@just.edu.jo', password: 'student123' })

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(res.body.user.role).toBe('student')
    studentToken = res.body.token
  })

  test('كلمة مرور غلط ما تشتغل', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@just.edu.jo', password: 'wrongpassword' })

    expect(res.statusCode).toBe(401)
  })

  test('إيميل مش موجود ما يشتغل', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'notfound@just.edu.jo', password: 'test123' })

    expect(res.statusCode).toBe(401)
  })

})

// تيست التذاكر
describe('Tickets Tests', () => {

  test('بدون توكن ما تقدر توصل للتذاكر', async () => {
    const res = await request(app).get('/api/tickets')
    expect(res.statusCode).toBe(401)
  })

  test('الطالب يقدر يرفع تذكرة جديدة', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'مشكلة في تسجيل الدخول',
        description: 'ما أقدر أدخل على حسابي الجامعي'
      })

    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('ticket')
    expect(res.body.ticket.status).toBe('open')
  })

  test('التصنيف التلقائي شغّال', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'wifi problem',
        description: 'the internet is not working in the library'
      })

    expect(res.statusCode).toBe(201)
    expect(res.body.ticket.category).toBe('مشكلة تقنية')
  })

  test('الطالب يشوف تذاكره', async () => {
    const res = await request(app)
      .get('/api/tickets')
      .set('Authorization', `Bearer ${studentToken}`)

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  test('الأدمن يشوف كل التذاكر', async () => {
    const res = await request(app)
      .get('/api/tickets')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  test('الأدمن ما يقدر يرفع تذكرة', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'test', description: 'test desc' })

    expect(res.statusCode).toBe(403)
  })

})
