import { useMemo } from "react";
import { Operation } from "@/hooks/data/types";
import { useLanguage } from "@/hooks/useLanguage";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

interface OperationTypeChartProps {
  operations: Operation[];
  className?: string;
}

export function OperationTypeChart({ operations, className }: OperationTypeChartProps) {
  const { t } = useLanguage();

  const typeData = useMemo(() => {
    if (!operations || operations.length === 0) return [];

    const typeCount: Record<string, number> = {};

    operations.forEach((op) => {
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
        value: count,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Show top 6 types
  }, [operations]);

  // Generate random color for each entry
  const getRandomColor = () => {
    const h = Math.floor(Math.random() * 360);
    const s = 70;
    const l = 50;
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  const coloredTypeData = useMemo(() => {
    return typeData.map((entry) => ({
      ...entry,
      color: getRandomColor(),
    }));
  }, [typeData]);

  if (coloredTypeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full text-muted-foreground">
        {t("noOperationsFound") || "No operations data available"}
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${className || ""}`}>
      <ChartContainer config={{}} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={coloredTypeData}
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={false}
            >
              {coloredTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>

            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    `${value} ${" "}`,
                    name,
                  ]}
                />
              }
            />

            {/* Legend with custom formatter to show color dot + translated name */}
            <Legend
              wrapperStyle={{ paddingTop: "16px" }}
              align="center"
              verticalAlign="bottom"
              layout="horizontal"
              formatter={(name) => {
                const item = coloredTypeData.find(d => d.name === name);
                return (
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: item?.color, marginRight: 4 }}>●</span>
                    {name}
                  </span>
                );
              }}
              payload={coloredTypeData.map(item => ({
                id: item.name,
                value: item.name,
                type: 'square' as const,
                color: item.color,
              }))}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
