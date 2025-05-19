
import React, { ReactNode } from "react";

export interface ChartCardProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  description?: string;
}

export function ChartCard({ title, children, icon, description }: ChartCardProps) {
  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">{title}</h3>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>}
      <div className="h-[300px]">{children}</div>
    </div>
  );
}
