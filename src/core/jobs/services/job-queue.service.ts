/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Job Queue Service
 * ============================================================
 */

import type {
  Job,
  JobHandler,
} from "../types/job.types";


class JobQueueService {


  private jobs:
    Job[] = [];


  private handlers:
    Map<string, JobHandler> =
    new Map();



  register<T>(
    name: string,
    handler: JobHandler<T>,
  ) {

    this.handlers.set(
      name,
      handler as JobHandler,
    );

  }



  add<T>(
    name: string,
    payload: T,
  ) {

    const job:
      Job<T> =
    {

      id:
        crypto.randomUUID(),

      name,

      payload,

      status:
        "PENDING",

      createdAt:
        new Date(),

    };


    this.jobs.push(
      job,
    );


    return job;

  }



  async process(
    jobId: string,
  ) {


    const job =
      this.jobs.find(
        item =>
          item.id === jobId,
      );


    if (!job) {

      return;

    }



    const handler =
      this.handlers.get(
        job.name,
      );


    if (!handler) {

      return;

    }



    try {

      job.status =
        "PROCESSING";


      await handler(
        job.payload,
      );


      job.status =
        "COMPLETED";


    } catch {

      job.status =
        "FAILED";

    }

  }



  getJobs() {

    return this.jobs;

  }



  clear() {

    this.jobs = [];

  }


}


export const jobQueueService =
  new JobQueueService();