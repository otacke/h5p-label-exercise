import './background.scss';

export default class Background {

  /**
   * @class
   * @param {object} params Parameters.
   * @param {object} params.backgroundImage Background image data.
   * @param {string} params.contentId Content ID for path resolution.
   */
  constructor(params) {
    this.dom = this.buildDOM(params);
  }

  /**
   * Build DOM.
   * @param {object} params Parameters.
   * @returns {HTMLElement} DOM element.
   */
  buildDOM(params = {}) {
    const dom = document.createElement('div');
    dom.classList.add('h5p-label-exercise-background');

    if (params.backgroundImage?.path) {
      const image = document.createElement('img');
      image.classList.add('h5p-label-exercise-background-image');
      image.src = H5P.getPath(
        params.backgroundImage.path,
        params.contentId,
      );
      image.alt = params.backgroundImage.alt || ''; // alt tag does not help in this context.
      dom.append(image);
    }

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
   * Toggle visibility.
   * @param {boolean} isVisible Whether the background should be visible.
   */
  toggleVisibility(isVisible) {
    this.dom.classList.toggle('display-none', !isVisible);
  }
}
