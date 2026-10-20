import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DialogActionButton({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      variant="outline"
      {...props}
      className={cn(
        "h-auto min-h-12 justify-start gap-3 whitespace-normal px-4 py-3 text-left",
        className,
      )}
    />
  );
}
