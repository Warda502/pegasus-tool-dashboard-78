
import React, { ReactNode } from "react";

export interface ChartCardProps {
  title: string;
  children: ReactNode;
}

export function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="h-full">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <div className="h-[300px]">{children}</div>
    </div>
  );
}
