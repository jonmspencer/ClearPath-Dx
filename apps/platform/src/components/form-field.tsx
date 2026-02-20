"use client";

import type { FieldError } from "react-hook-form";
import { Label } from "@clearpath/ui/components/label";
import { cn } from "@clearpath/ui/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: FieldError;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ label, htmlFor, error, required, className, children }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
    </div>
  );
}
