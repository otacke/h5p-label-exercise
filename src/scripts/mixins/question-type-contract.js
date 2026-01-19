import { VIEW_STATES } from '@services/constants.js';

/**
 * Mixin containing methods for H5P Question Type contract.
 */
export default class QuestionTypeContract {
  /**
   * Determine whether the task was answered already.
   * @returns {boolean} True if answer was given by user, else false.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-1}
   */
  getAnswerGiven() {
    return this.main.getAnswerGiven();
  }

  /**
   * Get current score.
   * @returns {number} Current score.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-2}
   */
  getScore() {
    return this.main.getScore();
  }

  /**
   * Get maximum possible score.
   * @returns {number} Maximum possible score.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-3}
   */
  getMaxScore() {
    return this.main.getMaxScore();
  }

  /**
   * Show solutions.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-4}
   */
  showSolutions() {
    this.main.showSolutions();
  }

  /**
   * Reset task.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-5}
   */
  resetTask() {
    this.reset();
  }

  /**
   * Get xAPI data.
   * @returns {object} XAPI statement.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
   */
  getXAPIData() {
    const xAPIEvent = this.createXAPIEvent('completed');

    return { statement: xAPIEvent.data.statement };
  }

  /**
   * Get current state.
   * @returns {object|undefined} Current state to be retrieved later.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-7}
   */
  getCurrentState() {
    if (!this.getAnswerGiven()) {
      // Nothing relevant to store, but previous state in DB must be cleared after reset
      return this.contentWasReset ? {} : undefined;
    }

    return {
      main: this.main.getCurrentState(),
      viewState: this.viewState,
    };
  }

  /**
   * Set current state as counterpart to getCurrentState (formally not part of the H5P Question Type contract).
   * @param {object} state State to be restored.
   */
  setCurrentState(state) {
    state = this.sanitizeState(state);

    this.resetTask();
    this.main.setCurrentState(state.main);

    if (
      state.viewState === VIEW_STATES.results &&
      this.viewState !== VIEW_STATES.results
    ) {
      this.checkAnswers({ skipXAPI: true });
    }
    else if (
      state.viewState === VIEW_STATES.solutions &&
      this.viewState !== VIEW_STATES.solutions
    ) {
      this.checkAnswers({ skipXAPI: true });
      this.showSolution();
    }
  }

  /**
   * Sanitize state object to only contain valid data.
   * @param {object} state State to sanitize.
   * @returns {object} Sanitized state.
   */
  sanitizeState(state = {}) {
    this.deleteAllPropsBut(state, ['main', 'viewState']);

    state.main = this.sanitizeMain(state.main);
    state.viewState = this.sanitizeViewState(state.viewState);

    return state;
  }

  /**
   * Delete all properties of an object except the allowed ones.
   * @param {object} obj Object to sanitize.
   * @param {string[]} allowedProperties List of allowed property names.
   */
  deleteAllPropsBut(obj = {}, allowedProperties = []) {
    Object.keys(obj).forEach((key) => {
      if (!allowedProperties.includes(key)) {
        delete obj[key];
      }
    });
  }

  /**
   * Sanitize main component state.
   * @param {object} state State to sanitize.
   * @returns {object} Sanitized state.
   */
  sanitizeMain(state = {}) {
    this.deleteAllPropsBut(state, ['labelsArea']);

    state.labelsArea = this.sanitizeLabelsArea(state.labelsArea);

    return state;
  }

  /**
   * Sanitize labels area state.
   * @param {object} state State to sanitize.
   * @returns {object} Sanitized state.
   */
  sanitizeLabelsArea(state = {}) {
    this.deleteAllPropsBut(state, ['labels']);

    state.labels = this.sanitizeLabels(state.labels);

    return state;
  }

  /**
   * Sanitize labels state.
   * @param {object[]} state State to sanitize.
   * @returns {object[]} Sanitized state.
   */
  sanitizeLabels(state = []) {
    if (!Array.isArray(state)) {
      return [];
    }

    return state.map((labelState) => this.sanitizeLabelItem(labelState));
  }

  /**
   * Sanitize label item state.
   * @param {object} state State to sanitize.
   * @returns {object} Sanitized state.
   */
  sanitizeLabelItem(state = {}) {
    this.deleteAllPropsBut(state, ['answer']);

    if (typeof state.answer !== 'string') {
      state.answer = '';
    }

    return state;
  }

  /**
   * Sanitize view state.
   * @param {number} state State to sanitize.
   * @returns {number} Sanitized state.
   */
  sanitizeViewState(state = VIEW_STATES.task) {
    if (!(Object.values(VIEW_STATES).includes(state))) {
      return VIEW_STATES.task;
    }

    return state;
  }
}
