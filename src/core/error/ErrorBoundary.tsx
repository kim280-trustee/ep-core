import React from "react";

import {
  logger,
} from "../logger";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary
  extends React.Component<
    Props,
    State
  > {
  constructor(
    props: Props,
  ) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(
    error: Error,
    errorInfo: React.ErrorInfo,
  ) {
    logger.error(
      error.message,
      errorInfo,
    );
  }

  render() {
    if (
      this.state.hasError
    ) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="rounded-lg border p-8 shadow">
            <h1 className="mb-2 text-2xl font-bold">
              Something went wrong
            </h1>

            <p className="text-gray-600">
              Please restart the application.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}