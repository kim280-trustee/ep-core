/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Job Types
 * ============================================================
 */

export interface Job<T = unknown> {

  id: string;

  name: string;

  payload: T;

  status:
    | "PENDING"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED";

  createdAt: Date;

}


export type JobHandler<T = unknown> =
  (
    payload: T,
  ) => Promise<void>;