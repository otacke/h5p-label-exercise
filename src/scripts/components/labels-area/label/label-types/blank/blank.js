import Label from '@components/labels-area/label/label.js';
import Telemetry from '@models/telemetry.js';
import { extend, splitSolutionString } from '@services/util.js';
import BlankHint from './blank-hint.js';
import BlankInput from './blank-input.js';
import BlankSolution from './blank-solution.js';
import './blank.scss';

/** @constant {number} VERTICAL_CENTER_PERCENTAGE Vertical center percentage for solution positioning. */
const VERTICAL_CENTER_PERCENTAGE = 50;

/** @constant {Map<string, string>} EVALUATION_STATES Possible evaluation states. */
const EVALUATION_STATES = new Map([
  ['correct', 'correct'],
  ['wrong', 'wrong'],
]);

export default class Blank extends Label {
  /**
   * @param {object} [params] Parameters
   * @param {number|string} params.position 1-based label position/index.
   * @param {number} params.total Total number of labels.
   * @param {string} params.solutions Solutions string (uses '/' as separator and \/ for escaped /).
   * @param {string} [params.hint] Optional hint text.
   * @param {object} params.telemetry Telemetry object with positioning/size.
   * @param {object} [callbacks] Callbacks.
   * @param {function} [callbacks.onInteracted] Called when label is interacted with.
   */
  constructor(params = {}, callbacks = {}) {
    super(params, callbacks);

    this.dom.classList.add('h5p-label-exercise-blank');

    this.solutions = splitSolutionString(this.params.solutions);

    this.telemetry = new Telemetry(
      this.params.telemetry,
      {
        adjustOverflowHeight: true,
        adjustOverflowWidth: true,
      },
    );

    this.input = this.buildBlankInput();
    this.dom.append(this.input.getDOM());

    this.solution = this.buildSolution();
    this.dom.append(this.solution.getDOM());

    if (this.params.hint) {
      this.hint = this.buildHint();
      this.dom.append(this.hint.getDOM());
    }
  }

  /**
   * Build blank input component.
   * @returns {BlankInput} Blank input instance.
   */
  buildBlankInput() {
    return new BlankInput({
      position: this.params.position,
      total: this.params.total,
      dictionary: this.params.dictionary,
    }, {
      onInteracted: () => {
        this.callbacks.onInteracted();
      },
    });
  }

  /**
   * Build solution display component.
   * @returns {BlankSolution} Blank solution instance.
   */
  buildSolution() {
    const solutionPosition = this.telemetry.getY() > VERTICAL_CENTER_PERCENTAGE ? 'top' : 'bottom';

    return new BlankSolution({
      anchor: solutionPosition,
      text: this.solutions.join('/'),
    });
  }

  /**
   * Build hint component.
   * @returns {BlankHint} Blank hint instance.
   */
  buildHint() {
    return new BlankHint({
      text: this.params.hint,
      position: this.params.position,
      dictionary: this.params.dictionary,
    });
  }

  /**
   * Build accessible label text indicating label index and correctness.
   * @param {boolean} isAnswerCorrect Whether current answer is correct.
   * @returns {string} Aria label text.
   */
  buildAriaLabel(isAnswerCorrect) {
    const labelIdentifier = this.params.dictionary.get('a11y.labelXOfY')
      .replaceAll('@current', this.params.position)
      .replaceAll('@total', this.params.total);

    const labelCorrectness = isAnswerCorrect ?
      this.params.dictionary.get('a11y.answeredCorrectly') :
      this.params.dictionary.get('a11y.answeredIncorrectly');

    return `${labelIdentifier} ${labelCorrectness}`;
  }

  /**
   * Disable input and hide hint (if present).
   */
  disable() {
    this.input.disable();
    this.hint?.hide();
  }

  /**
   * Enable input and show hint (if present).
   */
  enable() {
    this.input.enable();
    this.hint?.show();
  }

  /**
   * Get stored answer string.
   * @returns {string} Answer string.
   */
  getAnswer() {
    return this.input.getAnswer();
  }

  /**
   * Whether answer was given.
   * @returns {boolean} True if answer was given by user, else false.
   */
  getAnswerGiven() {
    return this.input.getAnswerGiven();
  }

  /**
   * Get serializable current state for persistence.
   * @returns {object} Current state object.
   */
  getCurrentState() {
    return { answer: this.getAnswer() };
  }

  /**
   * Get root DOM element for this label.
   * @returns {HTMLElement} Blank DOM element.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Get evaluation details for this label.
   * @returns {object} Evaluation object with answer, score, maxScore, isCorrect and solutions.
   */
  getEvaluation() {
    return {
      answer: this.getAnswer(),
      score: this.getScore(),
      maxScore: this.getMaxScore(),
      isCorrect: this.getScore() === this.getMaxScore(),
      solutions: this.solutions,
    };
  }

  /**
   * Compute score for this label.
   * @returns {number} Current score.
   */
  getScore() {
    if (this.params.caseSensitive) {
      return this.solutions.includes(this.getAnswer()) ? 1 : 0;
    }

    const normalizedUserAnswer = this.getAnswer().toLowerCase();
    const normalizedSolutions = this.solutions.map((solution) => solution.toLowerCase());

    return normalizedSolutions.includes(normalizedUserAnswer) ? 1 : 0;
  }

  /**
   * Maximum score for this label (always 1).
   * @returns {number} Maximum score.
   */
  getMaxScore() {
    return 1;
  }

  /**
   * Hide any evaluation state classes.
   */
  hideEvaluation() {
    EVALUATION_STATES.forEach((state) => {
      this.dom.classList.remove(state);
    });
  }

  /**
   * Reset label state to initial.
   */
  reset() {
    this.input.reset();
    this.solution.hide();
    this.hideEvaluation();
  }

  /**
   * Set aria-label text for underlying input.
   * @param {string} label Aria-label value.
   */
  setAriaLabel(label) {
    this.input.setAriaLabel(label);
  }

  /**
   * Show evaluation state.
   */
  showEvaluation() {
    const isAnswerCorrect = this.getScore() === this.getMaxScore();
    const evaluationState = isAnswerCorrect ?
      EVALUATION_STATES.get('correct') :
      EVALUATION_STATES.get('wrong');

    this.dom.classList.add(evaluationState);
    this.input.setAriaLabel(this.buildAriaLabel(isAnswerCorrect));
  }

  /**
   * Show solution.
   */
  showSolution() {
    const isAnswerCorrect = this.getScore() === this.getMaxScore();

    const labelSolution = isAnswerCorrect ?
      '' :
      this.params.dictionary.get('a11y.correctAnswer').replaceAll('@solution', this.solutions.join('/'));

    this.input.setAriaLabel(`${this.buildAriaLabel(isAnswerCorrect)} ${labelSolution}`.trim());

    if (!isAnswerCorrect) {
      this.solution.show();
    }
  }

  /**
   * Restore state from serialized state object.
   * @param {object} [state] State to restore.
   */
  setCurrentState(state = {}) {
    this.input.setAnswer(state.answer);
    this.input.setAnswerGiven(true);
  }

  /**
   * Resize.
   */
  resize() {
    this.hint?.ensureClosed();
  }
}
