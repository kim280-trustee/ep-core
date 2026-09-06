import type { ReportFilter, ReportSummary } from "../types";
import type { ReportRepository } from "../repositories";

export class ReportService {
  constructor(
    private readonly repository: ReportRepository,
  ) {}

  getSummary(filter: ReportFilter): Promise<ReportSummary> {
    return this.repository.getSummary(filter);
  }
}
