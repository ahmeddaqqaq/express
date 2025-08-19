/**
 * Date utilities for Radiant Express Wash
 * All date operations are configured for UTC+3 (Amman, Jordan) timezone
 * Business day starts at 1:00 AM UTC+3
 * 
 * IMPORTANT: These utilities work regardless of server timezone by explicitly
 * converting to/from UTC+3
 */

/**
 * Convert a date to UTC+3 timezone
 * @param date - Date in any timezone
 * @returns Date adjusted to UTC+3
 */
function toUTC3(date: Date): Date {
  // Get UTC time
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60 * 1000);
  // Add 3 hours to get UTC+3
  return new Date(utcTime + (3 * 60 * 60 * 1000));
}

/**
 * Convert UTC+3 date to local server time
 * @param utc3Date - Date in UTC+3
 * @returns Date in local server timezone
 */
function fromUTC3(utc3Date: Date): Date {
  // Subtract 3 hours to get UTC
  const utcTime = utc3Date.getTime() - (3 * 60 * 60 * 1000);
  // Convert to local time
  return new Date(utcTime - (new Date().getTimezoneOffset() * 60 * 1000));
}

/**
 * Get the start of business day (1 AM Jordan time)
 * @param date - The date to get start of day for (in any timezone)
 * @returns Date object representing 1 AM Jordan time of the given date
 */
export function getStartOfBusinessDay(date: Date = new Date()): Date {
  // Convert to Jordan timezone
  const jordanTime = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Amman"}));
  
  // If it's before 1 AM Jordan time, use previous day
  if (jordanTime.getHours() < 1) {
    jordanTime.setDate(jordanTime.getDate() - 1);
  }
  
  // Set to 1 AM Jordan time for the business day start
  jordanTime.setHours(1, 0, 0, 0);
  
  return jordanTime;
}

/**
 * Get the end of business day (0:59:59 AM Jordan time of next day)
 * @param date - The date to get end of day for (in any timezone)
 * @returns Date object representing 12:59:59 AM Jordan time just before 1 AM cutoff
 */
export function getEndOfBusinessDay(date: Date = new Date()): Date {
  // Get start of business day
  const startOfDay = getStartOfBusinessDay(date);
  
  // Add 24 hours to get to next day's 1 AM, then subtract 1 second to get 12:59:59 AM
  const endOfDay = new Date(startOfDay.getTime() + (24 * 60 * 60 * 1000) - 1000);
  
  return endOfDay;
}

/**
 * Get the current business date based on Jordan time
 * If it's between 12:00 AM and 1:00 AM Jordan time, returns yesterday's date
 * @returns The current business date
 */
export function getCurrentBusinessDate(): Date {
  const now = new Date();
  const jordanTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Amman"}));
  
  if (jordanTime.getHours() < 1) {
    // It's between 12:00 AM and 1:00 AM Jordan time, so we're still in yesterday's business day
    jordanTime.setDate(jordanTime.getDate() - 1);
  }
  
  // Return the business date (without time)
  jordanTime.setHours(0, 0, 0, 0);
  return jordanTime;
}

/**
 * Format date for API requests (YYYY-MM-DD) based on UTC+3 date
 * @param date - Date to format (in any timezone)
 * @returns Formatted date string based on UTC+3 date
 */
export function formatDateForAPI(date: Date): string {
  const utc3Date = toUTC3(date);
  const year = utc3Date.getFullYear();
  const month = String(utc3Date.getMonth() + 1).padStart(2, '0');
  const day = String(utc3Date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a given date is today's business day (in UTC+3)
 * @param date - Date to check (in any timezone)
 * @returns True if the date is today's business date
 */
export function isToday(date: Date): boolean {
  const utc3Date = toUTC3(date);
  const todayBusiness = getCurrentBusinessDate();
  
  return (
    utc3Date.getFullYear() === todayBusiness.getFullYear() &&
    utc3Date.getMonth() === todayBusiness.getMonth() &&
    utc3Date.getDate() === todayBusiness.getDate()
  );
}

/**
 * Get date range for statistics based on time range
 * All ranges are calculated based on UTC+3 business days
 * @param range - Time range ('day', 'month', 'year', 'all')
 * @returns Object with start and end dates in server timezone
 */
export function getDateRangeForStats(range: 'day' | 'month' | 'year' | 'all'): { start: Date; end: Date } {
  const now = new Date();
  let start: Date;
  const end: Date = now;

  switch (range) {
    case 'day':
      start = getStartOfBusinessDay(now);
      break;
    case 'month':
      const utc3Now = toUTC3(now);
      const monthStart = new Date(utc3Now.getFullYear(), utc3Now.getMonth(), 1);
      monthStart.setHours(1, 0, 0, 0); // 1 AM on first day of month
      start = fromUTC3(monthStart);
      break;
    case 'year':
      const utc3Year = toUTC3(now);
      const yearStart = new Date(utc3Year.getFullYear(), 0, 1);
      yearStart.setHours(1, 0, 0, 0); // 1 AM on first day of year
      start = fromUTC3(yearStart);
      break;
    case 'all':
    default:
      start = new Date(0); // Unix epoch
      break;
  }

  return { start, end };
}

/**
 * Format time for display in Jordan timezone
 * @param date - Date to format (in any timezone)
 * @returns Formatted time string in Jordan timezone
 */
export function formatJordanTime(date: Date): string {
  return date.toLocaleString('en-US', {
    timeZone: 'Asia/Amman',
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Format date and time for display in Jordan timezone
 * @param date - Date to format (in any timezone)
 * @returns Formatted date and time string in Jordan timezone
 */
export function formatJordanDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    timeZone: 'Asia/Amman',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Get the business day date for display (YYYY-MM-DD format)
 * Takes into account that business day starts at 1 AM Jordan time
 * @returns Business day date string
 */
export function getBusinessDayString(): string {
  const businessDate = getCurrentBusinessDate();
  
  const year = businessDate.getFullYear();
  const month = String(businessDate.getMonth() + 1).padStart(2, '0');
  const day = String(businessDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Check if we're currently in the overnight period (12:00 AM - 1:00 AM Jordan time)
 * When in this period, we're still in the previous day's business day
 * @returns True if currently in overnight period
 */
export function isInOvernightPeriod(): boolean {
  const now = new Date();
  const jordanTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Amman"}));
  
  return jordanTime.getHours() === 0; // Between 12:00 AM and 1:00 AM
}

/**
 * Get business day info for UI display
 * @returns Object with business day information for display
 */
export function getBusinessDayInfo(): {
  isCurrentBusinessDay: boolean;
  isOvernightPeriod: boolean;
  businessDateString: string;
  displayText: string;
} {
  const isOvernight = isInOvernightPeriod();
  const businessDateString = getBusinessDayString();
  const isCurrentBusinessDay = businessDateString === getBusinessDayString();
  
  let displayText = "Business Day";
  if (isOvernight) {
    displayText = "Business Day (Extended Hours)";
  }
  
  return {
    isCurrentBusinessDay,
    isOvernightPeriod: isOvernight,
    businessDateString,
    displayText
  };
}