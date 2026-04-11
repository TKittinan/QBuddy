// src/utils/generateShopId.ts

export const generateShopId = (
  shopName: string, 
  branchName: string, 
  existingPlaces: { name: string, placeId: string }[]
) => {
  // 1. นำชื่อร้าน (ไม่รวมสาขา) มาแยกคำเพื่อทำตัวย่อ
  const words = shopName.trim().split(/[\s\-_]+/);
  
  // 2. สร้างตัวย่อ (Initials) จากตัวอักษรแรกของแต่ละคำในชื่อร้าน
  let initials = words
    .filter(word => word.length > 0)
    .map(word => word.replace(/[^a-zA-Zก-ฮ0-9]/g, '').charAt(0).toUpperCase())
    .join("");
    
  if (!initials) {
    initials = "SHP";
  }
  
  // ตัดให้เหลือความยาวสูงสุด 5 ตัวอักษร เพื่อไม่ให้ ID ยาวเกินไป
  if (initials.length > 5) {
    initials = initials.substring(0, 5);
  }

  // 3. ใช้ชื่อร้านทั้งหมด (shopName) เป็น Brand Key เพื่อใช้นับสาขา
  // เพื่อให้มั่นใจว่าการนับสาขาจะไม่ไปซ้ำกับแบรนด์อื่นที่บังเอิญขึ้นต้นเหมือนกัน
  const brandKey = shopName.trim();

  // 4. นับจำนวนร้านที่มีชื่อร้านตรงกัน
  const brandBranches = existingPlaces.filter(p => 
    p.name.toLowerCase().startsWith(brandKey.toLowerCase())
  );

  const branchNumber = brandBranches.length + 1;

  // 5. ประกอบร่างชื่อเต็มสำหรับแสดงผล (ถ้ามีสาขาให้ใส่วงเล็บ)
  const displayFullName = branchName.trim() 
    ? `${shopName.trim()} (${branchName.trim()})`
    : shopName.trim();

  // 6. คืนค่ารูปแบบ ID และชื่อเต็มกลับไปให้ UI
  return {
    internalId: `${initials}${branchNumber}`,
    displayId: `#${initials}-${String(branchNumber).padStart(3, '0')}`,
    fullName: displayFullName
  };
};