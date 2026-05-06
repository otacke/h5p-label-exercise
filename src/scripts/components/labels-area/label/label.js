import Telemetry from '@models/telemetry.js';
import { LABEL_TYPE } from '@services/constants.js';
import { extend } from '@services/util.js';
import './label.scss';

export default class Label {
  /**
   * @param {object} [params] Parameters
   * @param {object} [callbacks] Callbacks.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = extend({}, params);
    this.callbacks = extend({
      onInteracted: () => {},
    }, callbacks);

    this.telemetry = new Telemetry(
      this.params.telemetry,
      {
        adjustOverflowHeight: true,
        adjustOverflowWidth: true,
      },
    );

    this.dom = document.createElement('div');
    this.dom.classList.add('h5p-label-exercise-label');
    this.dom.style.setProperty('--left', `${this.telemetry.getXAsString()}%`);
    this.dom.style.setProperty('--top', `${this.telemetry.getYAsString()}%`);
    this.dom.style.setProperty('--width', `${this.telemetry.getWidthAsString()}%`);
    this.dom.style.setProperty('--height', `${this.telemetry.getHeightAsString()}%`);
    this.dom.style.setProperty('--z-index', this.params.zIndex ?? 0);
    this.dom.setAttribute('role', 'listitem');
  }

  /**
   * Get root DOM element for this label.
   * @returns {HTMLElement} Label DOM element.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Determine whether this label counts as an exercise.
   * @returns {boolean} True if label is an exercise with a maximum score greater than zero.
   */
  isExercise() {
    return typeof this.getMaxScore === 'function' && this.getMaxScore() > 0;
  }

  /**
   * Toggle whether label element should have listitem role.
   * @param {boolean} isListItem True to set role="listitem", false to remove it.
   */
  toggleListItemRole(isListItem) {
    if (isListItem) {
      this.dom.setAttribute('role', 'listitem');
    }
    else {
      this.dom.removeAttribute('role');
    }
  }

  /**
   * Toggle label visibility.
   * @param {boolean} isVisible Whether label should be visible.
   * @param {boolean} [enforce] If true, also toggles text labels.
   */
  toggleVisibility(isVisible, enforce) {
    if (this.params.type === LABEL_TYPE.TEXT && !enforce) {
      return;
    }

    this.dom.classList.toggle('display-none', !isVisible);
  }

  /**
   * Disable label interaction.
   */
  disable() {
    // Needs to be implemented if required
  }

  /**
   * Enable label interaction.
   */
  enable() {
    // Needs to be implemented if required
  }

  /**
   * Reset label to initial state.
   */
  reset() {
    // Needs to be implemented if required
  }

  /**
   * Resize label.
   */
  resize() {
    // Needs to be implemented if required
  }

  /**
   * Set current state.
   * @param {object} state State.
   */
  setCurrentState(state) {
    // Needs to be implemented if required
  }

  /**
   * Get current state.
   * @returns {object} state State.
   */
  getCurrentState(state) {
    // Needs to be implemented if required
  }
}
