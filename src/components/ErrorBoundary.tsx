import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-destructive/10 text-destructive mb-6">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-3">Something went wrong</h1>
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              An unexpected error occurred. Please try refreshing the page or return to the homepage.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" /> Refresh
              </Button>
              <Button
                onClick={() => (window.location.href = "/")}
                className="gap-2"
              >
                <Home className="h-4 w-4" /> Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
