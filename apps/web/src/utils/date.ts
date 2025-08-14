export function formatDateTime(date: Date | string) {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}
