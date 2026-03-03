import type { InputHTMLAttributes } from "react"

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, ...props }: Props) {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <input
        className={`w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#B7BDF7] ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}