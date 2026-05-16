import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  fluid?: boolean;
}

export function PageContainer({ children, fluid = false }: PageContainerProps) {
  return (
    <div className={cn("p-4 xl:p-6 w-full", !fluid && "max-w-7xl mx-auto")}>
      {children}
    </div>
  );
}
