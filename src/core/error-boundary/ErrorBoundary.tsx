/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Error Boundary
 * ============================================================
 */

import {
  Component,
} from "react";


import type {
  ErrorInfo,
  ReactNode,
} from "react";


import {
  ErrorFallback,
} from "./error-fallback";



interface ErrorBoundaryProps {

  children: ReactNode;

}



interface ErrorBoundaryState {

  hasError: boolean;

  error?: Error;

}



export class ErrorBoundary
extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {


  constructor(
    props: ErrorBoundaryProps,
  ) {

    super(props);


    this.state = {

      hasError: false,

    };

  }



  static getDerivedStateFromError(
    error: Error,
  ) {


    return {

      hasError: true,

      error,

    };

  }



  componentDidCatch(
    error: Error,
    info: ErrorInfo,
  ) {


    console.error(
      "EP Core Error:",
      error,
      info,
    );

  }



  render() {


    if (
      this.state.hasError
    ) {

      return (

        <ErrorFallback
          error={
            this.state.error
          }
        />

      );

    }



    return this.props.children;

  }


}