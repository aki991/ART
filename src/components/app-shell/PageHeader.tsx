interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-text-primary font-rajdhani tracking-wide">
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-text-tertiary text-sm">{description}</p>
      )}
    </div>
  );
}
