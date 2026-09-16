/**
 * Shared motion tokens — the app's "Apple feel" vocabulary.
 *
 * Apple designs motion with two designer-friendly parameters instead of
 * mass/stiffness/damping: a damping ratio (overshoot) and a response
 * (how quickly the value settles, in seconds). Framer Motion's spring
 * `bounce`/`duration` API maps 1:1 onto them — `bounce = 1 - dampingRatio`.
 *
 * House rule: keep everything critically damped (bounce 0) by default, and
 * only add bounce when the gesture itself carried momentum (a flick, a
 * throw, a drag release). Overshoot on something that merely faded in reads
 * as a glitch; overshoot on something you flicked reads as physics.
 */

/** Apple's own values, translated. */
export const spring = {
  /** Move/reposition — damping 1.0, response 0.4. The safe default. */
  ui: { type: 'spring', bounce: 0, duration: 0.4 },
  /** Press feedback — same curve, but snappier so the press feels instant. */
  press: { type: 'spring', bounce: 0, duration: 0.25 },
  /** Sheets/drawers — damping 0.8, response 0.3. */
  sheet: { type: 'spring', bounce: 0.2, duration: 0.3 },
  /** Drag/flick release — bounce is earned by the gesture's velocity. */
  momentum: { type: 'spring', bounce: 0.2, duration: 0.4 },
};

/** Pressed-state presets, sized for the target's own scale. */
export const press = {
  /** Full-width CTAs and large surfaces. */
  large: { scale: 0.97 },
  /** Compact controls and icon buttons. */
  small: { scale: 0.94 },
};

/**
 * Apple's momentum projection: where a flick is *going*, not where the finger
 * let go. Snap to the nearest target after projecting, never from the release
 * point alone.
 *
 * @param {number} velocity px/s at release
 * @param {number} [decelerationRate=0.998] 0.998 = normal scroll feel
 * @returns {number} distance the gesture would travel before resting
 */
export const project = (velocity, decelerationRate = 0.998) =>
  (velocity / 1000) * (decelerationRate / (1 - decelerationRate));
