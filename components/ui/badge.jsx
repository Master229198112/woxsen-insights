import { cn } from "@/lib/utils"

const Badge = ({ className, variant = "default", children, ...props }) => {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors"
  
  const variantClasses = {
    default: "border-transparent bg-blue-600 text-white hover:bg-blue-700",
    secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline: "border-gray-300 bg-white text-gray-900 hover:bg-gray-50",
    destructive: "border-transparent bg-red-600 text-white hover:bg-red-700"
  }

  const classes = cn(
    baseClasses,
    variantClasses[variant] || variantClasses.default,
    className
  )

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  )
}

export { Badge }
