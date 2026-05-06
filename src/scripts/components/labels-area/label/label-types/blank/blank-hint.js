import { extend } from '@services/util.js';
import './blank-hint.scss';

export default class BlankHint {
  /**
   * @param {object} [params] Parameters for label hint.
   * @param {string} params.text Hint text.
   * @param {number} params.position Position number.
   * @param {object} params.dictionary Translation dictionary.
   */
  constructor(params = {}) {
    this.params = extend({}, params);

    this.dom = H5P.JoubelUI.createTip(
      this.params.text,
      { tipLabel: this.params.dictionary.get('a11y.showHint').replaceAll('@current', this.params.position) },
    )[0];

    this.dom.addEventListener('click', () => {
      this.updateAriaLabel();
    });
  }

  /**
   * Update aria-label text.
   */
  updateAriaLabel() {
    const ariaLabel = this.hasPopupOpen() ?
      this.params.dictionary.get('a11y.hideHint') :
      this.params.dictionary.get('a11y.showHint').replaceAll('@current', this.params.position);
    this.dom.setAttribute('aria-label', ariaLabel);
  }

  /**
   * Determine whether the popup is open.
   * @returns {boolean} True if popup open, else false.
   */
  hasPopupOpen() {
    return this.dom.getAttribute('aria-expanded') === 'true';
  }

  /**
   * Get DOM element for label hint.
   * @returns {HTMLElement} DOM element.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Ensure that popup is closed.
   */
  ensureClosed() {
    if (!this.hasPopupOpen()) {
      return;
    }

    this.dom.click();
  }

  /**
   * Hide label hint.
   */
  hide() {
    this.dom.classList.add('display-none');
  }

  /**
   * Show label hint.
   */
  show() {
    this.dom.classList.remove('display-none');
  }
}
