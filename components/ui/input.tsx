import * as React from "react";
import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const hasError = props["aria-invalid"] === "true";

  return (
    <div className="relative">
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-weak selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "border-input-border focus:border-input-border-focus focus:shadow-md",
          "aria-invalid:ring-input-border-error/20 dark:aria-invalid:ring-input-border-error/40 aria-invalid:border-input-border-error",
          hasError && "pr-8",
          className
        )}
        {...props}
      />
      {hasError && (
        <AlertCircle className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive pointer-events-none" />
      )}
    </div>
  );
}

export { Input };
