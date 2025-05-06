
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

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
  const [chartHeight, setChartHeight] = useState('300px');
  
  // Update chart height based on container size
  useEffect(() => {
    const updateHeight = () => {
      // Get available height in the card based on viewport size
      const viewportHeight = window.innerHeight;
      const minHeight = 250; // Minimum height for the chart
      const maxHeight = 400; // Maximum height for the chart
      
      // Calculate optimal height (responsive to screen size)
      const calculatedHeight = Math.max(
        minHeight, 
        Math.min(maxHeight, viewportHeight * 0.35)
      );
      
      setChartHeight(`${calculatedHeight}px`);
    };
    
    // Set initial height
    updateHeight();
    
    // Update height on window resize
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <Card className={cn("h-full overflow-hidden", className)}>
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
      <CardContent className="p-1 sm:p-2 md:p-4" style={{ height: chartHeight }}>
        {children}
      </CardContent>
    </Card>
  );
}
