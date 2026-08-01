/**
 * ============================================================
 * Job Provider
 * ============================================================
 */

import type {
  PropsWithChildren,
} from "react";


import {
  JobContext,
} from "./job.context";


import {
  jobQueueService,
} from "./services/job-queue.service";



export function JobProvider({

  children,

}: PropsWithChildren) {


  return (

    <JobContext.Provider
      value={jobQueueService}
    >

      {children}

    </JobContext.Provider>

  );

}