/**
 * Lightweight haptic feedback. No-op where the Vibration API is unavailable
 * (desktop, iOS Safari) so callers can fire it unconditionally.
 *
 * @param {number} [duration=10] vibration length in ms
 */
export const haptic = (duration = 10) => {
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.vibrate === 'function'
  ) {
    try {
      navigator.vibrate(duration);
    } catch {
      // Some browsers throw if called without a user gesture — ignore.
    }
  }
};
