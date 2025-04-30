
import { useMemo } from "react";
import { format, parseISO, startOfMonth, subMonths } from "date-fns";
import { Operation } from "@/hooks/data/types";
import { useLanguage } from "@/hooks/useLanguage";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface MonthlyOperationsChartProps {
  operations: Operation[];
  className?: string;
}

export function MonthlyOperationsChart({ operations, className }: MonthlyOperationsChartProps) {
  const { t } = useLanguage();
  
  const monthlyData = useMemo(() => {
    if (!operations || operations.length === 0) return [];
    
    // Get the last 6 months
    const monthsToShow = 6;
    const today = new Date();
    const months = Array.from({ length: monthsToShow }, (_, i) => {
      const month = startOfMonth(subMonths(today, i));
      return {
        month: month,
        monthKey: format(month, "yyyy-MM"),
        displayName: format(month, "MMM"),
        count: 0
      };
    }).reverse();
    
    console.log("Processing operations for chart:", operations.length);
    
    // Custom date parser for format: yyyy/MM/dd hh:mm -tt
    const extractMonthYearKey = (timeStr: string): string | null => {
      if (!timeStr) return null;
      
      try {
        // Handle format like "2023/04/25 09:30 -AM" or similar variations
        const regex = /(\d{4})\/(\d{2})\/\d{2}/;
        const match = timeStr.match(regex);
        
        if (match && match.length >= 3) {
          const year = match[1];
          const month = match[2];
          return `${year}-${month}`;
        }
        
        return null;
      } catch (error) {
        console.error("Failed to parse date:", timeStr, error);
        return null;
      }
    };
    
    // Count operations per month
    operations.forEach(op => {
      if (!op.Time) return;
      
      const monthKey = extractMonthYearKey(op.Time);
      if (!monthKey) return;
      
      const monthData = months.find(m => m.monthKey === monthKey);
      if (monthData) {
        monthData.count += 1;
      }
    });
    
    console.log("Monthly data:", months.map(m => ({
      key: m.monthKey, 
      name: m.displayName, 
      count: m.count
    })));
    
    return months.map(m => ({
      name: m.displayName,
      value: m.count
    }));
  }, [operations]);
  
  const chartConfig = {
    operations: {
      label: t("operations") || "Operations",
      theme: {
        light: "#7E69AB",
        dark: "#9b87f5"
      }
    }
  };
  
  if (monthlyData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground">
        {t("noOperationsFound") || "No operations data available"}
      </div>
    );
  }
  
  return (
    <div className={`w-full h-[250px] ${className || ""}`}>
      <ChartContainer config={chartConfig} className="h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12 }}
              width={30}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent 
                  labelFormatter={(value) => 
                    `${value} ${t("monthData") || "Data"}`
                  }
                />
              }
            />
            <Bar 
              dataKey="value" 
              name="operations" 
              radius={[4, 4, 0, 0]}
              fill="var(--color-operations)"
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
