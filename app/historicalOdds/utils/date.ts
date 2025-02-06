// Formats a date to the API's expected ISO8601 format without milliseconds
export function formatDateForAPI(date: Date): string {
  // Remove milliseconds from the ISO string
  return date.toISOString().split('.')[0] + 'Z';
}

// Validates if a date string is in the correct ISO8601 format for the API
export function isValidAPIDate(dateString: string): boolean {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
  if (!isoDateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

// Gets a default date 7 days ago at midnight UTC
export function getDefaultHistoricalDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}
