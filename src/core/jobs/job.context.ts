/**
 * ============================================================
 * Job Context
 * ============================================================
 */

import {
  createContext,
} from "react";


import {
  jobQueueService,
} from "./services/job-queue.service";


export const JobContext =
  createContext(
    jobQueueService,
  );