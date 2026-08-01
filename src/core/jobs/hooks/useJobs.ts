/**
 * ============================================================
 * useJobs Hook
 * ============================================================
 */

import {
  jobQueueService,
} from "../services/job-queue.service";


import type {
  JobHandler,
} from "../types/job.types";


export function useJobs() {


  function add<T>(
    name: string,
    payload: T,
  ) {

    return jobQueueService.add(
      name,
      payload,
    );

  }



  function register<T>(
    name: string,
    handler: JobHandler<T>,
  ) {

    jobQueueService.register(
      name,
      handler,
    );

  }



  function process(
    id: string,
  ) {

    return jobQueueService.process(
      id,
    );

  }



  function getJobs() {

    return jobQueueService.getJobs();

  }



  return {

    add,

    register,

    process,

    getJobs,

  };

}