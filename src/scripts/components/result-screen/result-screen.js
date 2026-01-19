import { extend } from '@services/util.js';
import { isThemingSupported } from '@services/util-h5p.js';
import ResultScreenDOM from './result-screen-engine.js';
import './result-screen.scss';

export default class ResultScreen {
  /**
   * @class
   * @param {object} params Parameters.
   * @param {object} params.dictionary Dictionary service.
   * @param {function} callbacks Callbacks.
   * @param {function} callbacks.onVisibilityChanged Called when visibility changes with aria message.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = extend({}, params);

    this.callbacks = extend({
      onVisibilityChanged: () => {},
    }, callbacks);

    const { dom, placeholder } = this.buildDOM();
    this.placeholder = placeholder;
    this.dom = dom;

    this.toggleVisibility(false);
  }

  /**
   * Build DOM.
   * @returns {object} DOM elements.
   */
  buildDOM() {
    const dom = document.createElement('div');
    dom.classList.add('h5p-label-exercise-result-screen');

    const placeholder = document.createElement('div');
    dom.appendChild(placeholder);

    return { dom, placeholder };
  }

  /**
   * Get DOM.
   * @returns {HTMLElement} DOM element.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Check whether solutions are being shown.
   * @returns {boolean} Whether solutions are shown.
   */
  isShowingSolutions() {
    return this.isShowingSolutionsState;
  }

  /**
   * Set results to be shown.
   * @param {object} params Parameters.
   * @param {Array} params.evaluation Evaluation data.
   * @param {boolean} params.showSolutions Whether to show solutions.
   */
  setResults(params) {
    const { evaluation, showSolutions } = params;

    const score = evaluation.reduce((sum, labelEvaluation) => sum + labelEvaluation.score, 0);
    const maxScore = evaluation.reduce((sum, labelEvaluation) => sum + labelEvaluation.maxScore, 0);
    const scoreHeader = this.params.dictionary.get('l10n.resultScreenScoreHeader')
      .replace('@score', score)
      .replace('@total', maxScore);

    const questions = evaluation.map((labelEvaluation, index) => {
      const hasOnlyOneSolution = labelEvaluation.solutions.length === 1;
      const correctAnswerPrepend = hasOnlyOneSolution
        ? this.params.dictionary.get('l10n.correctAnswerPrependSingular')
        : this.params.dictionary.get('l10n.correctAnswerPrependPlural');

      return {
        title: `${this.params.dictionary.get('l10n.label')} ${index + 1}`,
        points: labelEvaluation.score,
        isCorrect: labelEvaluation.isCorrect,
        userAnswer: labelEvaluation.answer,
        ...(showSolutions && {
          correctAnswer: labelEvaluation.solutions.join(', '),
          correctAnswerPrepend: correctAnswerPrepend,
        }),
      };
    });

    const resultsScreenParams = {
      header: this.params.dictionary.get('l10n.resultScreenHeader'),
      scoreHeader: scoreHeader,
      questionGroups: [{
        listHeaders: [
          this.params.dictionary.get('l10n.labels'),
          this.params.dictionary.get('l10n.score'),
        ],
        questions: questions,
      }],
    };

    const resultScreenDOM = (isThemingSupported() && !!H5P.Components) ?
      H5P.Components.ResultScreen(resultsScreenParams) :
      ResultScreenDOM(resultsScreenParams);

    this.dom.replaceChild(resultScreenDOM, this.placeholder);
    this.placeholder = resultScreenDOM;

    this.isShowingSolutionsState = showSolutions;
  }

  /**
   * Toggle visibility.
   * @param {boolean} isVisible Whether the result screen should be visible.
   */
  toggleVisibility(isVisible) {
    if (typeof isVisible !== 'boolean' || this.isVisibleState === isVisible) {
      return;
    }
    this.isVisibleState = isVisible;

    this.dom.classList.toggle('display-none', !isVisible);

    const ariaMessage = isVisible ?
      this.params.dictionary.get('a11y.resultScreenShown') :
      this.params.dictionary.get('a11y.resultScreenHidden');

    this.callbacks.onVisibilityChanged(ariaMessage);
  }
}
