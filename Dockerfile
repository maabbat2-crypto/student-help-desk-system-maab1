# بنبني على نفس إصدار Node اللي استخدمناه بالتطوير
FROM node:20-alpine

# بحدد مجلد الشغل داخل الكونتينر
WORKDIR /app

# بنسخ ملفات الـ package أول عشان يستفيد من الكاش
COPY package*.json ./

# بثبّت الحزم
RUN npm install --production

# بنسخ باقي الملفات
COPY . .

# البورت اللي بيشتغل عليه التطبيق
EXPOSE 5000

# الأمر اللي بشغّل التطبيق
CMD ["node", "server.js"]
