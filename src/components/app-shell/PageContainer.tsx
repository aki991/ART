interface PageContainerProps {
  children: React.ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      {children}
    </div>
  );
}
