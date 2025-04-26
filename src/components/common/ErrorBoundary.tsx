
import { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryBase extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Component error caught:", error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <DefaultErrorFallback 
          error={this.state.error} 
          resetError={this.resetErrorBoundary} 
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const { t } = useLanguage();
  
  return (
    <Alert variant="destructive" className="my-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{t("errorOccurred") || "An error occurred"}</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-4">{error?.message || t("unexpectedError")}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetError}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {t("tryAgain") || "Try again"}
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export const ErrorBoundary = (props: ErrorBoundaryProps) => {
  return <ErrorBoundaryBase {...props} />;
};
