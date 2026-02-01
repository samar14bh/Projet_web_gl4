/**
 * Format a date string to French locale format
 * @param dateString ISO date string or null/undefined
 * @returns Formatted date string or '-' if invalid
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
