import * as React from "react";
import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  const hasError = props["aria-invalid"] === "true";

  return (
    <div className="relative">
      <textarea
        data-slot="textarea"
        className={cn(
          "placeholder:text-weak dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "border-input-border focus:border-input-border-focus focus:shadow-md",
          "aria-invalid:ring-input-border-error/20 dark:aria-invalid:ring-input-border-error/40 aria-invalid:border-input-border-error",
          hasError && "pr-8",
          className
        )}
        {...props}
      />
      {hasError && (
        <AlertCircle className="absolute right-2.5 top-3 h-4 w-4 text-destructive pointer-events-none" />
      )}
    </div>
  );
}

export { Textarea };
