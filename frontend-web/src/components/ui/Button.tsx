import React from "react";
import { Slot } from "@radix-ui/react-slot";
import clsx from "clsx";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-400",
  secondary:
    "bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-500",
  outline:
    "border border-gray-300 text-gray-700 hover:bg-gray-100",
  ghost:
    "text-gray-600 hover:bg-gray-100",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  className,
  asChild = false,
  ...props
}) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={clsx(
        "px-4 py-2 rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 disabled:opacity-50",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
};