import type { ButtonHTMLAttributes, ReactNode } from "react"
import clsx from "clsx"

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none"

  const variants = {
    primary:
      "bg-[#30364F] text-white hover:bg-[#404869]",
    secondary:
      "bg-[#B7BDF7] text-[#30364F] hover:opacity-90",
    outline:
      "border border-[#30364F] text-[#30364F] hover:bg-gray-100",
    danger:
      "bg-red-500 text-white hover:bg-red-600",
    ghost:
      "text-[#30364F] hover:bg-gray-100",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  }

  return (
    <button
      className={clsx(
        base,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        loading && "opacity-70 cursor-not-allowed"
      )}
      disabled={loading}
      {...props}
    >
      {iconLeft}
      {loading ? "Loading..." : children}
      {iconRight}
    </button>
  )
}