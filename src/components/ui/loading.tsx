
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
    <div className={`flex flex-col items-center justify-center py-8 ${containerClasses[size]} ${className}`}>
      <div className="relative">
        {/* Vegas glow effect with animation */}
        <div className="absolute inset-0 filter blur-xl opacity-70 animate-pulse vegas-glow" style={{ transform: "scale(1.2)" }}>
          <svg 
            version="1.2" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 -12 500 500" 
            className={cn(sizeClasses[size], "text-primary")}
          >
            <path 
              fill="#ff9c01" 
              fillRule="evenodd" 
              d="m230.2 92q4.8-0.2 8.9 2.7 63 36.2 125.6 73.6 1 52.5 0 105.2-40.3 24.7-81.5 48-5.1 3.6-9.4-0.5-0.5-49.9-0.9-99.5-22.1-13.9-44.4-26.6-0.5 105-1.2 210.2-1.7 2.7-4.8 3.4-40.7-23.3-80.8-47.2-4.3-1.9-6.2-6-1-102.9 0-205.7 2.4-6 8.4-4.1 38.6 22.8 77.4 45.5 3.1 2.2 6.7 2.2-1.9-48.2-0.7-96.9 1.2-2.4 2.9-4.3z"
            />
          </svg>
        </div>
        
        {/* Moving Vegas outline effect */}
        <div className="absolute inset-0 vegas-outline-container">
          <svg 
            version="1.2" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 -12 500 500" 
            className={cn(sizeClasses[size], "vegas-outline")}
          >
            <path 
              fill="none" 
              stroke="#ff9c01" 
              strokeWidth="3"
              strokeDasharray="1500"
              strokeDashoffset="1500"
              className="animate-vegas-outline"
              d="m230.2 92q4.8-0.2 8.9 2.7 63 36.2 125.6 73.6 1 52.5 0 105.2-40.3 24.7-81.5 48-5.1 3.6-9.4-0.5-0.5-49.9-0.9-99.5-22.1-13.9-44.4-26.6-0.5 105-1.2 210.2-1.7 2.7-4.8 3.4-40.7-23.3-80.8-47.2-4.3-1.9-6.2-6-1-102.9 0-205.7 2.4-6 8.4-4.1 38.6 22.8 77.4 45.5 3.1 2.2 6.7 2.2-1.9-48.2-0.7-96.9 1.2-2.4 2.9-4.3z"
            />
          </svg>
        </div>
      </div>
      
      <p className="mt-6 text-gray-500">{text}</p>
    </div>
  );
}
