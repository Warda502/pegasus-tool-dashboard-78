
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva("transition-all duration-200 hover:shadow-md", {
  variants: {
    variant: {
      default: "border-border/50",
      primary: "border-primary/50 hover:border-primary/80",
      success: "border-green-500/50 hover:border-green-500/80",
      warning: "border-yellow-500/50 hover:border-yellow-500/80",
      danger: "border-red-500/50 hover:border-red-500/80",
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
