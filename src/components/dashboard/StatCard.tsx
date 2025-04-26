
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva("", {
  variants: {
    variant: {
      default: "",
      primary: "border-primary/50",
      success: "border-green-500/50",
      warning: "border-yellow-500/50",
      danger: "border-red-500/50",
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

interface StatCardProps extends VariantProps<typeof cardVariants> {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  description, 
  variant, 
  className 
}: StatCardProps) {
  return (
    <Card className={`${cardVariants({ variant })} ${className || ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
