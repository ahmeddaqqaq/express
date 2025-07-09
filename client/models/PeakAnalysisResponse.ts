/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PeakHoursResponse } from './PeakHoursResponse';
import type { PeakDaysResponse } from './PeakDaysResponse';

export type PeakAnalysisResponse = {
  peakHours: Array<PeakHoursResponse>;
  peakDays: Array<PeakDaysResponse>;
};