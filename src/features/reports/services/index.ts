import { reportRepository } from "../repositories";
import { ReportService } from "./report.service";

export const reportService = new ReportService(reportRepository);

export * from "./report.service";
