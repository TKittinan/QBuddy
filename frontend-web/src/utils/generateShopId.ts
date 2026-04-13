export function generateShopId(name: string, branch: string, categories: string[], existingPlaces: any[]) {
  const cleanName = name.trim();
  const cleanBranch = branch.trim();
  const fullName = cleanBranch ? `${cleanName} (${cleanBranch})` : cleanName;

  const firstCharName = cleanName.charAt(0).toUpperCase() || 'X';
  const firstCharBranch = cleanBranch.charAt(0).toUpperCase() || '';
  const namePrefix = `${firstCharName}${firstCharBranch}`.toUpperCase();

  const categoryMap: Record<string, string> = {
    "ร้านอาหาร": "R",
    "คาเฟ่": "C",
    "เสริมสวยอื่นๆ": "B",
  };
  const catCode = (categories || [])
    .map(cat => categoryMap[cat] || "O")
    .join(""); 

  const prefix = `${namePrefix}-${catCode || 'X'}`;

  // 3. จัดเตรียมชุดแท็กเป็น String เพื่อเอาไว้เช็คว่าต้องรันเลขคิวต่อกันไหม
  // (ถ้าเลือกลำดับต่างกัน String นี้จะต่างกัน ถือว่าเป็นคนละประเภทธุรกิจทันที)
  const categoriesStr = JSON.stringify(categories || []);

  // 4. คำนวณหาเลข Sequence รันคิวสาขา (001, 002)
  let maxSeq = 0;

  existingPlaces.forEach(place => {
    // ตัดเอาเฉพาะชื่อร้าน (ไม่เอาสาขา)
    const placeName = place.name.split(' (')[0].trim().toLowerCase();
    
    // ดึงหมวดหมู่ของร้านเก่ามาเช็ค (ต้องเป๊ะทั้งข้อมูลและลำดับ)
    const placeCategoriesStr = JSON.stringify(place.categories || []);

    // กฎเหล็ก: "ชื่อร้านตรงกัน" และ "ลำดับแท็กตรงกัน 100%"
    if (placeName === cleanName.toLowerCase() && placeCategoriesStr === categoriesStr) {
       // ค้นหาเลข 3 หลักสุดท้ายจาก placeId (เช่น #AT-RC-002 จะดึง 002)
       const match = place.placeId.match(/-(\d+)$/);
       if (match) {
         const seq = parseInt(match[1], 10);
         if (seq > maxSeq) {
           maxSeq = seq;
         }
       }
    }
  });

  const nextSeq = maxSeq + 1;
  
  // 🌟 รวมร่าง ID เช่น #AA-RC-001
  const displayId = `#${prefix}-${nextSeq.toString().padStart(3, '0')}`;

  // รหัสภายในระบบที่รับประกันว่าไม่มีทางซ้ำ
  const internalId = `sys_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  return {
    internalId,
    displayId,
    fullName
  };
}