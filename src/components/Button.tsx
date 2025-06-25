import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success" | "warning";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  className = "",
  type = "button",
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white shadow-lg hover:shadow-xl focus:ring-slate-500 dark:from-slate-400 dark:to-slate-500 dark:hover:from-slate-500 dark:hover:to-slate-600 transition-all duration-200 ease-in-out",
    secondary:
      "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white shadow-lg hover:shadow-xl focus:ring-gray-500 dark:from-gray-400 dark:to-gray-500 dark:hover:from-gray-500 dark:hover:to-gray-600 transition-all duration-200 ease-in-out",
    danger:
      "bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white shadow-lg hover:shadow-xl focus:ring-red-500 dark:from-red-400 dark:to-red-500 dark:hover:from-red-500 dark:hover:to-red-600 transition-all duration-200 ease-in-out",
    success:
      "bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white shadow-lg hover:shadow-xl focus:ring-emerald-500 dark:from-emerald-400 dark:to-emerald-500 dark:hover:from-emerald-500 dark:hover:to-emerald-600 transition-all duration-200 ease-in-out",
    warning:
      "bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white shadow-lg hover:shadow-xl focus:ring-amber-500 dark:from-amber-400 dark:to-amber-500 dark:hover:from-amber-500 dark:hover:to-amber-600 transition-all duration-200 ease-in-out",
  };

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
