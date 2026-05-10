"use client";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  icon?: React.ReactNode;
  min?: string;
  step?: string;
  helpText?: string;
}

export default function InputField({
  label,
  type = "text",
  placeholder,
  value,
  error,
  onChange,
  required = false,
  icon,
  min,
  step,
  helpText,
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="w-full">
      <label className="block text-neutral-900 text-xs sm:text-sm font-medium mb-1.5">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
            {icon}
          </div>
        )}
        <input
          type={isPassword ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          min={min}
          step={step}
          className={`w-full rounded-xl border ${icon ? "pl-10" : "px-4"} ${isPassword ? "pr-14" : "pr-4"} py-3 text-sm text-neutral-900 bg-white
    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
    placeholder:text-neutral-400 placeholder:text-sm transition-all
    ${error
              ? "border-danger focus:ring-danger/20"
              : "border-neutral-200"
            }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 font-medium text-xs uppercase tracking-wider"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {helpText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
