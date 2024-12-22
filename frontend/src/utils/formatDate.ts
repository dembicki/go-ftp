export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}
