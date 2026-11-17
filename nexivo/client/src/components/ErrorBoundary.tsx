import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorState } from "@/components/ui/states";

interface Props { children: ReactNode; resetKey?: string; fallback?: (reset: () => void) => ReactNode }
interface State { error: Error | null }

/** Catches render errors so one broken route or section never takes down the whole site. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error("[ErrorBoundary]", error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(this.reset);
    return (
      <div className="container-x py-24">
        <ErrorState title="Something went wrong on this page" text="The rest of the site still works. Try again, or head back home."
          onRetry={() => { this.reset(); window.location.reload(); }} />
      </div>
    );
  }
}
