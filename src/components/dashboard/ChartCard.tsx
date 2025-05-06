
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  icon?: React.ReactNode;
  className?: string;
  description?: string;
  children: React.ReactNode;
}

export function ChartCard({ 
  title, 
  icon, 
  className,
  description,
  children 
}: ChartCardProps) {
  return (
    <Card className={cn("h-full overflow-hidden flex flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-col">
          <CardTitle className="text-sm md:text-base font-medium flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-1 sm:p-2 md:p-6 flex-1 flex items-center justify-center">
        <div className="w-full h-full flex-1 flex items-center justify-center">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
