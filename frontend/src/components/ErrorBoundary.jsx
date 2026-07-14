import { Component } from "react";
import { Link } from "react-router-dom";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Networkers UI error", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-12 text-slate-950">
        <div className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase text-blue-600">Networkers</p>
          <h1 className="mt-3 text-3xl font-black">The UI hit a recoverable error.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Refresh the page or return to the landing page. The app is still running, and this screen is here to avoid a blank page.
          </p>
          <div className="mt-6 flex gap-3">
            <button className="btn-primary" onClick={() => window.location.reload()}>Refresh</button>
            <Link className="btn-muted" to="/">Go home</Link>
          </div>
        </div>
      </div>
    );
  }
}
