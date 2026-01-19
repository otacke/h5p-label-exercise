import { extend } from '@services/util.js';
import './fullscreen-button.scss';

export default class FullscreenButton {

  /**
   * @class
   * @param {object} params Parameters.
   * @param {object} params.dictionary Dictionary service.
   * @param {object} callbacks Callbacks.
   * @param {function} callbacks.onClick Click callback.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = extend({}, params);

    this.callbacks = extend({
      onClick: () => {},
    }, callbacks);

    this.dom = this.buildDOM();
  }

  /**
   * Build DOM.
   * @returns {HTMLElement} DOM element.
   */
  buildDOM() {
    const dom = document.createElement('button');
    dom.classList.add('h5p-label-exercise-fullscreen-button');
    dom.setAttribute('type', 'button');
    dom.setAttribute('aria-label', this.params.dictionary.get('a11y.enterFullscreen'));
    dom.addEventListener('click', () => {
      this.callbacks.onClick();
    });

    return dom;
  }

  /**
   * Get DOM.
   * @returns {HTMLElement} DOM element.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Set fullscreen state.
   * @param {boolean} isFullscreen Whether fullscreen mode is active.
   */
  setFullscreenState(isFullscreen) {
    if (isFullscreen) {
      this.dom.setAttribute('aria-label', this.params.dictionary.get('a11y.exitFullscreen'));
    }
    else {
      this.dom.setAttribute('aria-label', this.params.dictionary.get('a11y.enterFullscreen'));
    }
  }

  /**
   * Toggle visibility.
   * @param {boolean} isVisible Whether the button should be visible.
   */
  toggleVisibility(isVisible) {
    this.dom.classList.toggle('display-none', !isVisible);
  }
}
