import {

  Component,

  type ErrorInfo,

  type ReactNode,

} from "react";



interface Props {

  children: ReactNode;

}



interface State {

  hasError: boolean;

}





export class ErrorBoundary extends Component<

  Props,

  State

> {



  state: State = {

    hasError: false,

  };





  static getDerivedStateFromError(): State {

    return {

      hasError: true,

    };

  }





  componentDidCatch(

    error: Error,

    info: ErrorInfo,

  ): void {



    console.error(

      "Application Error:",

      error,

    );



    console.error(

      "Component Stack:",

      info.componentStack,

    );



    // Future:
    // logger.error(error)
    // notification.error(...)
    // sendToMonitoring(error)



  }





  render() {



    if (this.state.hasError) {

      return (

        <div className="flex min-h-screen items-center justify-center">

          <div className="text-center">

            <h1 className="text-2xl font-bold">

              Something went wrong

            </h1>

            <p className="mt-2">

              Please refresh the page.

            </p>

          </div>

        </div>

      );

    }



    return this.props.children;

  }

}