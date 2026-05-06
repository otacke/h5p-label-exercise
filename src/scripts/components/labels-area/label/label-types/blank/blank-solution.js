import './blank-solution.scss';

/** @constant {Map<string, string>} ANCHOR_CLASSES Position classes for solution display. */
const ANCHOR_CLASSES = new Map([
  ['top', 'top'],
  ['bottom', 'bottom'],
]);

/**
 * Class representing label solution.
 */
export default class BlankSolution {
  /**
   * Create instance of LabelSolution.
   * @param {object} [params] Parameters for label solution.
   * @param {string} [params.anchor] Position anchor for solution display.
   * @param {string} [params.text] Text for label solution.
   */
  constructor(params = {}) {
    this.dom = this.buildDOM(params);
    this.hide();
  }

  /**
   * Build DOM element for label solution.
   * @param {object} [params] Parameters for label solution.
   * @param {string} [params.anchor] Position anchor for solution display.
   * @param {string} [params.text] Text for label solution.
   * @returns {HTMLElement} DOM element for label solution.
   */
  buildDOM(params = {}) {
    const dom = document.createElement('div');
    dom.classList.add('h5p-label-exercise-solution');
    dom.classList.add(ANCHOR_CLASSES.get(params.anchor) || 'bottom');
    dom.innerText = params.text || '';
    dom.setAttribute('aria-label', params.text || '');
    dom.setAttribute('aria-hidden', 'true');
    H5P.Tooltip(dom);

    return dom;
  }

  /**
   * Get DOM element for label solution.
   * @returns {HTMLElement} DOM element for label solution.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Hide label solution.
   */
  hide() {
    this.dom.classList.add('display-none');
  }

  /**
   * Show label solution.
   */
  show() {
    this.dom.classList.remove('display-none');
  }
}
