
import { Loader } from "lucide-react";

export interface LoadingProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loading({ text = "Loading...", size = "md", className = "" }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  const containerClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <div className={`flex flex-col items-center justify-center py-8 ${containerClasses[size]} ${className}`}>
      <Loader className={`${sizeClasses[size]} animate-spin text-primary mb-2`} />
      <p className="text-gray-500">{text}</p>
    </div>
  );
}
