import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  let dateLabel;
  if (targetDate.getTime() === today.getTime()) {
    dateLabel = "今日";
  } else if (targetDate.getTime() === tomorrow.getTime()) {
    dateLabel = "明日";
  } else {
    dateLabel = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  }

  const time = date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return `${dateLabel} ${time}〜`;
}
