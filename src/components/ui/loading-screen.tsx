
import React from "react";
import { Loader } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-background dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
