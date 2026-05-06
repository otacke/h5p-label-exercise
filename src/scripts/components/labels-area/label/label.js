import BlankHint from './label-types/blank/blank-hint.js';
import BlankInput from './label-types/blank/blank-input.js';
import BlankSolution from './label-types/blank/blank-solution.js';
import Telemetry from '@models/telemetry.js';
import { LABEL_TYPE } from '@services/constants.js';
import { extend, splitSolutionString } from '@services/util.js';
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
    this.dom.setAttribute('role', 'listitem');
  }

  getDOM() {
    return this.dom;
  }

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

  toggleVisibility(isVisible, enforce) {
    if (this.params.type === LABEL_TYPE.TEXT && !enforce) {
      return;
    }

    this.dom.classList.toggle('display-none', !isVisible);
  }

  disable() {
    // Needs to be implemented if required
  }

  enable() {
    // Needs to be implemented if required
  }

  reset() {
    // Needs to be implemented if required
  }

  resize() {
    // Needs to be implemented if required
  }
}
