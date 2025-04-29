
import { useMemo } from "react";
import { Operation } from "@/hooks/data/types";
import { useLanguage } from "@/hooks/useLanguage";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

interface OperationTypeChartProps {
  operations: Operation[];
  className?: string;
}

export function OperationTypeChart({ operations, className }: OperationTypeChartProps) {
  const { t } = useLanguage();
  
  const typeData = useMemo(() => {
    if (!operations || operations.length === 0) return [];
    
    const typeCount: Record<string, number> = {};
    
    operations.forEach(op => {
      const type = op.OprationTypes || "Unknown";
      if (!typeCount[type]) {
        typeCount[type] = 0;
      }
      typeCount[type] += 1;
    });
    
    // Convert to chart data format and sort by count
    return Object.entries(typeCount)
      .map(([type, count]) => ({
        name: type,
        value: count
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Show top 6 types
  }, [operations]);
  
  // Custom colors for pie chart
  const COLORS = [
    "#9b87f5", // primary
    "#7E69AB", // secondary
    "#6E59A5", // tertiary
    "#8B5CF6", // vivid
    "#D946EF", // magenta
    "#F97316", // orange
    "#0EA5E9", // blue
  ];
  
  const chartConfig = {
    directUnlock: {
      label: t("directUnlock") || "Direct Unlock",
      theme: {
        light: COLORS[0],
        dark: COLORS[0]
      }
    },
    frpRemove: {
      label: t("frpRemove") || "FRP Remove",
      theme: {
        light: COLORS[1],
        dark: COLORS[1]
      }
    },
    readInfo: {
      label: t("readInfo") || "Read Info",
      theme: {
        light: COLORS[2],
        dark: COLORS[2]
      }
    },
    other: {
      label: t("other") || "Other",
      theme: {
        light: COLORS[3],
        dark: COLORS[3]
      }
    }
  };
  
  if (typeData.length === 0) {
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
          <PieChart>
            <Pie
              data={typeData}
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={false}
            >
              {typeData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <ChartTooltip
              content={
                <ChartTooltipContent 
                  formatter={(value, name) => [
                    value,name
                  ]} 
                />
              }
            />
            <Legend 
              content={
                <ChartLegendContent />
              } 
              layout="horizontal"
              verticalAlign="bottom" 
              align="center"
              wrapperStyle={{ paddingTop: "16px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
