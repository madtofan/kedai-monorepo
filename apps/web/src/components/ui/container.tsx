import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

export function VerticalContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("container mx-auto max-w-3xl p-4", className)}>
      {children}
    </div>
  );
}
