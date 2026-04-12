export const CATEGORY_LIST = [
  "ร้านอาหาร", "คาเฟ่", "ร้านทำผม", "โรงพยาบาล", 
  "อีเวนท์", "อุทยาน", "เสริมสวยอื่นๆ", "ร้านนวด"
];

interface CategorySelectProps {
  selectedCategories: string[];
  onChange: (newCategories: string[]) => void;
}

export function CategorySelect({ selectedCategories, onChange }: CategorySelectProps) {
  // ฟังก์ชันสลับสถานะการเลือก
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onChange(selectedCategories.filter(c => c !== category));
    } else {
      onChange([...selectedCategories, category]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_LIST.map((cat) => (
        <button
          key={cat} 
          type="button" 
          onClick={() => toggleCategory(cat)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
            selectedCategories.includes(cat) 
              ? 'bg-teal-50 border-teal-200 text-teal-700' 
              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}