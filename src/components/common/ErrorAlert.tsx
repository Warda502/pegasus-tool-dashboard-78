
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorAlertProps {
  title: string;
  description?: string;
  className?: string;
}

export function ErrorAlert({ title, description, className = "" }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className={`my-4 ${className}`}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  );
}
