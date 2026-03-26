export const generateShopId = (shopName: string, branch: number = 1): string => {
  // 1. ลบข้อความในวงเล็บออกก่อน
  const cleanName = shopName.replace(/\(.*?\)/g, "").trim();
  
  // 2. แยกคำด้วยช่องว่าง ขีด หรือ Underscore และดึงอักษรตัวแรกมาทำเป็นพิมพ์ใหญ่
  const initials = cleanName
    .split(/[\s\-_]+/) 
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase())
    .join("");
    
  // 3. นำตัวย่อมารวมกับเลขสาขา
  return `${initials}${branch}`;
};