import { Component, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: any) {
    // eslint-disable-next-line no-console
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Something went wrong.</h2>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#fff5f5",
              border: "1px solid #fecaca",
              padding: 12,
              borderRadius: 8,
            }}
          >
            {this.state.error.message}
          </pre>
          <p style={{ color: "#6b7280" }}>
            Open DevTools → Console for details.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
