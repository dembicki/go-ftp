export function formatFileSize(size: number): string {
  if (size === 0) return "-";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    units.length - 1
  );
  return `${(size / Math.pow(1024, exponent)).toFixed(1)} ${units[exponent]}`;
}
