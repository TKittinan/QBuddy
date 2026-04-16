# USER FLOW
1. register
2. login → เอา token
3. ดูร้าน
4. join queue / booking
5. สร้าง activity
6. join activity
7. chat
8. ใช้ AI แนะนำร้าน

# ADMIN FLOW
1. login (admin)
2. สร้าง restaurant
3. สร้าง category
4. ผูก restaurant-category
5. สร้าง promotion
6. สร้าง queue
7. กด next queue

# สรุปภาพรวม
ระบบนี้เป็น platform สำหรับการจองร้านอาหารและหาเพื่อน
โดยมีฟีเจอร์หลักคือ

- ระบบ auth และ role (user/admin)
- ระบบร้านอาหารและหมวดหมู่
- ระบบคิวและการจอง
- ระบบโปรโมชัน
- ระบบ activity สำหรับหาเพื่อน
- ระบบ chat แบบ real-time logic
- ระบบ AI recommendation

ทั้งหมดเชื่อมกันผ่าน relational database (PostgreSQL + Prisma)