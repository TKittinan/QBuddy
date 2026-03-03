interface Props {
  variant: "success" | "warning" | "danger" | "info"
  children: React.ReactNode
}

export default function Badge({ variant, children }: Props) {
  const styles = {
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  )
}