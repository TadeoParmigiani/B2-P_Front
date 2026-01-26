import type { ReactNode } from "react";

interface ButtonProps {
  handleClick?: () => void;
  label?: string;
  children?: ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export const Button = (props: ButtonProps) => {
  const { handleClick, label, children, variant = "default", size = "default", disabled = false, type = "button", className = "" } = props;
  
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 bg-white text-gray-900 hover:bg-gray-100",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    ghost: "bg-transparent hover:bg-gray-100",
    link: "bg-transparent text-blue-600 underline hover:text-blue-800",
  };
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8 text-lg",
    icon: "h-10 w-10 p-0",
  };

  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      type={type}
    >
      {children || label}
    </button>
  );
};