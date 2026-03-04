import { useState } from "react";
import { ChevronDownIcon } from "@radix-ui/react-icons";

interface Props {
  options: string[];
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export default function FilterDropdown({
  options,
  defaultValue,
  onChange,
}: Props) {
  const [selected, setSelected] = useState(defaultValue || options[0]);
  const [open, setOpen] = useState(false);

  const handleSelect = (value: string) => {
    setSelected(value);
    setOpen(false);
    onChange?.(value);
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium hover:bg-slate-200 transition"
      >
        {selected}
        <ChevronDownIcon />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border z-50">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 ${
                selected === option ? "text-indigo-600 font-medium" : ""
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}