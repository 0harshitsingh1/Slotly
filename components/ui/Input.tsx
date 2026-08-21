import React, { useId } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, required, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label} {required && <span className="text-danger-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          className={`block w-full min-h-[44px] rounded-lg border px-3.5 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:text-slate-100 ${
            error
              ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20 dark:border-danger-500"
              : "border-slate-300 focus:border-brand-500 focus:ring-brand-500/20 dark:border-slate-700 dark:focus:border-brand-500"
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-xs font-medium text-danger-600 dark:text-danger-400">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = "", id, required, rows = 3, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label} {required && <span className="text-danger-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          required={required}
          className={`block w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:text-slate-100 ${
            error
              ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20 dark:border-danger-500"
              : "border-slate-300 focus:border-brand-500 focus:ring-brand-500/20 dark:border-slate-700 dark:focus:border-brand-500"
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-xs font-medium text-danger-600 dark:text-danger-400">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
