import Label from './label/label.js';
import { extend } from '@services/util.js';
import './labels-area.scss';

export default class LabelArea {
  /**
   * @class
   * @param {object} params Parameters.
   * @param {Array} params.labels Array of label parameters.
   * @param {string} params.introductionId ID for aria-labelledby attribute.
   * @param {object} params.dictionary Dictionary for label text.
   * @param {object} callbacks Callbacks.
   * @param {function} callbacks.onInteracted Called when user interacts with labels.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = extend({ labels: [] }, params);

    this.callbacks = extend({
      onInteracted: () => {},
    }, callbacks);

    const labelsLength = this.params.labels.length;
    this.labels = this.params.labels.map((labelParams, index) => {
      return new Label(
        {
          ...labelParams,
          position: index + 1,
          total: labelsLength,
          dictionary: this.params.dictionary,
        },
        {
          onInteracted: () => {
            this.callbacks.onInteracted();
          },
        },
      );
    });

    this.dom = this.buildDOM();
  }

  /**
   * Build DOM structure for labels area.
   * @returns {HTMLUListElement} List element containing all labels.
   */
  buildDOM() {
    const dom = document.createElement('ul');
    dom.setAttribute('aria-labelledby', this.params.introductionId);
    dom.classList.add('h5p-label-exercise-labels-area');

    this.labels.forEach((label) => {
      dom.append(label.getDOM());
    });

    return dom;
  }

  /**
   * Disable all labels.
   */
  disable() {
    this.labels.forEach((label) => {
      label.disable();
    });
  }

  /**
   * Enable all labels.
   */
  enable() {
    this.labels.forEach((label) => {
      label.enable();
    });
  }

  /**
   * Get all label DOM elements.
   * @returns {Array<HTMLElement>} Array of label DOM elements.
   */
  getAllLabelDOMs() {
    return this.labels.map((label) => label.getDOM());
  }

  /**
   * Check if any label has been answered.
   * @returns {boolean} True if at least one label has been answered.
   */
  getAnswerGiven() {
    return this.labels.some((label) => label.getAnswerGiven());
  }

  /**
   * Get current state of all labels.
   * @returns {object} Object containing labels state array.
   */
  getCurrentState() {
    return { labels: this.labels.map((label) => label.getCurrentState()) };
  }

  /**
   * Get DOM element of labels area.
   * @returns {HTMLUListElement} Root ul element.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Get evaluation data for all labels.
   * @returns {object[]} Evaluation objects for each label.
   */
  getEvaluation() {
    return this.labels.map((label) => label.getEvaluation());
  }

  /**
   * Get maximum possible score from all labels.
   * @returns {number} Sum of all label max scores.
   */
  getMaxScore() {
    return this.labels.reduce((maxScore, label) => {
      return maxScore + label.getMaxScore();
    }, 0);
  }

  /**
   * Get label by its index.
   * @param {number} index Index of label.
   * @returns {Label} Label at specified index.
   */
  getLabelByIndex(index) {
    if (index < 0 || index >= this.labels.length) {
      throw new Error(`Label index ${index} is out of bounds.`);
    }

    return this.labels[index];
  }

  /**
   * Get total score from all labels.
   * @returns {number} Sum of all label scores.
   */
  getScore() {
    return this.labels.reduce((score, label) => {
      return score + label.getScore();
    }, 0);
  }

  /**
   * Get xAPI response string for all labels.
   * @returns {string} "Comma-joined" answers from all labels.
   */
  getXAPIResponse() {
    return this.labels.map((label) => label.getAnswer()).join('[,]');
  }

  /**
   * Hide evaluation feedback for all labels.
   */
  hideEvaluation() {
    this.labels.forEach((label) => {
      label.hideEvaluation();
    });
  }

  /**
   * Reclaim all labels that may have been moved.
   */
  reclaimLabels() {
    const nodes = this.labels.map((label) => {
      label.toggleListItemRole(true);
      return label.getDOM();
    });

    this.dom.replaceChildren(...nodes);
  }

  /**
   * Reset all labels to their initial state.
   */
  reset() {
    this.labels.forEach((label) => {
      label.reset();
    });
    this.reclaimLabels();
  }

  /**
   * Set aria-label for label at specified index.
   * @param {number} index Index of label.
   * @param {string} ariaLabel aria-label text.
   */
  setAriaLabelForLabelAtIndex(index, ariaLabel) {
    const label = this.getLabelByIndex(index);
    label.setAriaLabel(ariaLabel);
  }

  /**
   * Set current state of all labels.
   * @param {object} state State object containing labels array.
   * @param {Array} state.labels Array of label states.
   */
  setCurrentState(state = {}) {
    this.labels.forEach((label, index) => {
      if (state.labels?.[index]) {
        label.setCurrentState(state.labels[index]);
      }
    });
  }

  /**
   * Show evaluation feedback for all labels.
   */
  showEvaluation() {
    this.labels.forEach((label) => {
      label.showEvaluation();
    });
  }

  /**
   * Show solutions for all labels.
   */
  showSolutions() {
    this.labels.forEach((label) => {
      label.showSolution();
    });
  }

  /**
   * Toggle visibility of labels area.
   * @param {boolean} isVisible Whether area should be visible.
   */
  toggleVisibility(isVisible) {
    this.dom.classList.toggle('display-none', !isVisible);
  }
}
