export const CATEGORY_LIST = [
  "ร้านอาหาร", "คาเฟ่", "เสริมสวยอื่นๆ"
];

interface CategorySelectProps {
  // ปรับให้รับได้ทั้ง string (อันเดียว) หรือ string[] (หลายอัน)
  value?: string | string[]; 
  onChange: (value: any) => void;
}

export function CategorySelect({ value = [], onChange }: CategorySelectProps) {
  // ตรวจสอบว่าเป็น Array หรือไม่ เพื่อให้จัดการ Logic ได้ถูกต้อง
  const isArray = Array.isArray(value);
  const selectedList = isArray ? value : [value];

  const toggleCategory = (category: string) => {
    if (isArray) {
      
      // แบบเลือกได้หลายอัน (Multi-select)
      if (selectedList.includes(category)) {
        onChange(selectedList.filter(c => c !== category));
      } else {
        onChange([...selectedList, category]);
      }
    } else {
      // แบบเลือกอันเดียว (Single-select) สำหรับหน้า PlaceManagement
      onChange(category);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_LIST.map((cat) => {
        const isActive = selectedList.includes(cat);
        return (
          <button
            key={cat} 
            type="button" 
            onClick={() => toggleCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              isActive 
                ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-sm' 
                : 'bg-white border-slate-200 text-slate-500 hover:border-teal-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}