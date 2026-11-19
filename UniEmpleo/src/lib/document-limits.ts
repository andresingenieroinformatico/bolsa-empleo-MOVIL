/**
 * Single source of truth for the documents a student can attach.
 *
 * The backend (Laravel `max:20480`) and the Next.js gateway enforce the same
 * limit, so the app must not drift from them. Keep the three in sync.
 */
export const MAX_CV_MB = 20;
export const MAX_CV_BYTES = MAX_CV_MB * 1024 * 1024;

export function isCvWithinLimit(size?: number | null): boolean {
  return size === undefined || size === null || size <= MAX_CV_BYTES;
}
