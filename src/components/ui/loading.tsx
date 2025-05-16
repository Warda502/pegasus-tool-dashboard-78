
import { cn } from "@/lib/utils";

export interface LoadingProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loading({ text = "Loading...", size = "md", className = "" }: LoadingProps) {
  const sizeClasses = {
    sm: "h-20 w-20",
    md: "h-32 w-32",
    lg: "h-48 w-48"
  };

  const containerClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
<div className="flex flex-col items-center justify-center py-8 text-gray-500">
<div className="relative">
  {/* Glow Layer */}
  <svg
    version="1.2"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 -12 500 500"
    className={cn(sizeClasses[size], "absolute filter blur-md opacity-70")}
  >
    <path
      fill="none"
      stroke="#ff9c01"
      strokeWidth="3"
      strokeDasharray="1500"
      strokeDashoffset="1500"
      className="animate-vegas-outline"
      d="m230.2 92q4.8-0.2 8.9 2.7 63 36.2 125.6 73.6 ...z"
    />
  </svg>

  {/* Outline Animation Layer */}
  <svg
    version="1.2"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 -12 500 500"
    className={cn(sizeClasses[size], "relative z-10")}
  >
    <path
      fill="none"
      stroke="#ff9c01"
      strokeWidth="3"
      strokeDasharray="1500"
      strokeDashoffset="1500"
      className="animate-vegas-outline"
      d="m230.2 92q4.8-0.2 8.9 2.7 63 36.2 125.6 73.6 ...z"
    />
  </svg>
</div>
  <p className="mt-6">{text}</p>
</div>
  );
}
