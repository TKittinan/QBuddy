// 🌟 Utility กลางสำหรับจัดการเรื่องเวลาเปิด-ปิดร้าน
export const checkIsShopOpen = (openTime: string, closeTime: string): boolean => {
  if (!openTime || !closeTime) return false;
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openHour, openMin] = openTime.split(':').map(Number);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);

  const openTimeMinutes = openHour * 60 + openMin;
  let closeTimeMinutes = closeHour * 60 + closeMin;

  // กรณีร้านเปิดข้ามวัน (เช่น 12:00 ถึง 05:00)
  if (closeTimeMinutes <= openTimeMinutes) {
    closeTimeMinutes += 24 * 60;
  }

  let checkMinutes = currentMinutes;
  // ปรับเวลาที่เช็คให้ถูกต้องหากตอนนี้เป็นช่วงหลังเที่ยงคืนแต่ยังไม่ปิดร้าน
  if (closeTimeMinutes > 24 * 60 && currentMinutes < openTimeMinutes) {
    checkMinutes += 24 * 60;
  }

  return checkMinutes >= openTimeMinutes && checkMinutes < closeTimeMinutes;
};