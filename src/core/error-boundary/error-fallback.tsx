/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Error Fallback UI
 * ============================================================
 */


interface ErrorFallbackProps {

  error?: Error;

}



export function ErrorFallback({

  error,

}: ErrorFallbackProps) {


  return (

    <div>

      <h1>
        Something went wrong
      </h1>


      <p>
        The application encountered an unexpected error.
      </p>


      {
        error && (

          <small>

            {error.message}

          </small>

        )
      }

    </div>

  );

}