import Main from '@components/main.js';
import QuestionTypeContract from '@mixins/question-type-contract.js';
import XAPI from '@mixins/xapi.js';
import { DEFAULT_LANGUAGE_TAG, LABEL_TYPE, VIEW_STATES } from '@services/constants.js';
import Dictionary from '@services/dictionary.js';
import { addMixins, extend } from '@services/util.js';
import { getSemanticsDefaults, isThemingSupported } from '@services/util-h5p.js';
import '@styles/h5p-label-exercise.scss';

/**
 * @constant {number} SMALL_SCREEN_THRESHOLD_PX Threshold to determine small screen size in pixels.
 * Not using CSS container queries here as we need to react in JavaScript as well.
 */
const SMALL_SCREEN_THRESHOLD_PX = 600;

/** @constant {number} BASE_WIDTH_PX Base width for font size computation. */
const BASE_WIDTH_PX = 640;

/** @constant {number} BASE_FONT_SIZE_PX Base font size. */
const BASE_FONT_SIZE_PX = 16;

/** @constant {number} SHOW_FEEDBACK_DELAY_MS Delay in milliseconds to trigger extra resize after showing feedback. */
const SHOW_FEEDBACK_DELAY_MS = 250;

export default class LabelExercise extends H5P.Question {
  /**
   * @class
   * @param {object} params Parameters passed by the editor.
   * @param {number} contentId Content's id.
   * @param {object} [extras] Saved state, metadata, etc.
   */
  constructor(params, contentId, extras = {}) {
    super('label-exercise', { theme: isThemingSupported() });

    try {
      addMixins(LabelExercise, [QuestionTypeContract, XAPI]);
    }
    catch (error) {
      console.error('Could not apply mixins:', error);
    }

    // Sanitize parameters
    const semanticsDefaults = getSemanticsDefaults();
    const defaults = extend({
      labelEditor: { labels: [] },
      behaviour: {
        enableCheckButton: true,
      },
    }, semanticsDefaults);
    this.params = extend(defaults, params);

    this.params = this.sanitizeParams(this.params);
    this.params = this.sortLabelsByPosition(this.params); // Ensure labels tab order matches visual order

    this.contentId = contentId;
    this.extras = extras;

    this.introductionId = H5P.createUUID();

    // Fill dictionary
    this.dictionary = new Dictionary();
    this.dictionary.fill({ l10n: this.params.l10n, a11y: this.params.a11y });

    this.introductionFallback = this.dictionary.get('a11y.fillInLabels');

    this.previousState = this.extras.previousState || {};

    this.isFullscreenAllowed = this.isRoot() && H5P.fullscreenSupported;
    this.hasAlternatives = this.params.labelEditor.labels.some((label) => {
      return /[^\\]\//.test(label.solutions);
    });

    try {
      this.languageTag = formatLanguageCode(extras?.metadata?.defaultLanguage);
    }
    catch (error) {
      this.languageTag = DEFAULT_LANGUAGE_TAG;
    }

    this.main = new Main(
      {
        contentId: this.contentId,
        dictionary: this.dictionary,
        taskDescription: this.params.taskDescription,
        introductionId: this.introductionId,
        backgroundImage: this.params.backgroundImage,
        labels: this.params.labelEditor.labels,
        fullscreenAllowed: this.isFullscreenAllowed,
        behaviour: this.params.behaviour,
        baseWidth: BASE_WIDTH_PX,
        baseFontSize: BASE_FONT_SIZE_PX,
      }, {
        onContentVisible: (container) => {
          this.handleContentVisible(container);
        },
        onToggleFullscreen: () => {
          this.toggleFullscreen();
        },
        onInteracted: () => {
          this.triggerXAPIInteracted();
        },
        onRead: (message) => {
          this.read(message); // via H5P.Question
        },
      });

    this.setViewState(VIEW_STATES.task);

    if (this.isFullscreenAllowed) {
      this.on('enterFullScreen', () => {
        this.main.toggleFullscreenMode(true);
      });

      this.on('exitFullScreen', () => {
        this.main.toggleFullscreenMode(false);
      });

      window.addEventListener('deviceorientation', () => {
        this.main.toggleFullscreenMode(H5P.isFullscreen);
      });
    }

    if (this.params.behaviour.hotspotDisplay === 'automatic') {
      this.on('resize', () => {
        if (!this.container) {
          return;
        }

        this.main.resize();

        // Not done with container queries as we also need to react in JS
        const isSmallScreen = this.container.offsetWidth < SMALL_SCREEN_THRESHOLD_PX;
        this.main.toggleHotspotVisibility(isSmallScreen);
      });
    }
  }

  /**
   * Sanitize parameters.
   * @param {object} params Parameters to be sanitized.
   * @returns {object} Sanitized parameters.
   */
  sanitizeParams(params) {
    const sanitizedParams = extend({}, params);

    sanitizedParams.labelEditor.labels = sanitizedParams.labelEditor.labels.filter((label, index) => {

      const hasSolution = typeof label.solutions === 'string' && label.solutions.trim() !== '';
      if ((label.type === LABEL_TYPE.BLANK || label.type === LABEL_TYPE.DROPDOWN) && !hasSolution) {
        console.warn(`Label ${index + 1} is missing a solution.`);
      }

      const requiredTelemetryProps = ['x', 'y', 'width'];
      if (label.type === LABEL_TYPE.TEXT) {
        requiredTelemetryProps.push('height');
      }

      const hasTelemetry = requiredTelemetryProps.every((prop) => !!label.telemetry[prop]);
      if (!hasTelemetry) {
        console.warn(`Label ${index + 1} is missing telemetry data.`);
      }

      return hasTelemetry && (
        label.type === LABEL_TYPE.BLANK && hasSolution ||
        label.type === LABEL_TYPE.DROPDOWN && hasSolution ||
        label.type === LABEL_TYPE.TEXT
      );
    });

    return sanitizedParams;
  }

  /**
   * Sort labels by position (top to bottom, left to right) to adhere to accessibility tab order.
   * @param {object} params Parameters containing labels to be sorted.
   * @returns {object} Parameters with labels sorted by position.
   */
  sortLabelsByPosition(params) {
    const reorderedParams = extend({}, params);

    reorderedParams.labelEditor.labels.sort((a, b) => {
      return a.telemetry.y - b.telemetry.y || a.telemetry.x - b.telemetry.x;
    });

    return reorderedParams;
  }

  /**
   * Handle content became visible.
   * Required because H5P.Question creates the DOM and does not notify when done.
   * @param {HTMLElement} container H5P container element.
   */
  handleContentVisible(container) {
    this.container = container;

    window.requestAnimationFrame(() => {
      this.trigger('resize');
    });
  }

  /**
   * Toggle fullscreen mode.
   */
  toggleFullscreen() {
    if (!this.isFullscreenAllowed) {
      return;
    }

    const targetState = !H5P.isFullscreen;

    if (targetState) {
      H5P.fullScreen(H5P.jQuery(this.container), this);
    }
    else {
      H5P.exitFullScreen();
    }
  }

  /**
   * Handle user interacted with the task.
   */
  triggerXAPIInteracted() {
    this.trigger(this.createXAPIEvent('interacted'));
  }

  /**
   * Set view state.
   * @param {string|number} state View state as VIEW_STATES constant (preferred) or string.
   */
  setViewState(state) {
    const viewState = typeof state === 'string' ? VIEW_STATES[state] : state;

    if (!Object.values(VIEW_STATES).includes(viewState)) {
      return;
    }

    this.viewState = viewState;
    this.toggleButtonsVisibility(this.viewState);
  }

  /**
   * Toggle buttons visibility based on view state.
   * @param {number} viewState View state as VIEW_STATES constant.
   */
  toggleButtonsVisibility(viewState) {
    switch (viewState) {
      case VIEW_STATES.task:
        if (this.params.behaviour.enableCheckButton) {
          this.showButton('check-answer');
        }
        this.hideButton('show-solution');
        this.hideButton('try-again');
        break;

      case VIEW_STATES.results:
        this.hideButton('check-answer');

        if (this.params.behaviour.enableSolutionsButton && this.getScore() < this.getMaxScore()) {
          this.showButton('show-solution');
        }
        else {
          this.hideButton('show-solution');
        }

        if (this.params.behaviour.enableRetry) {
          this.showButton('try-again');
        }
        break;

      case VIEW_STATES.solutions:
        this.hideButton('check-answer');
        this.hideButton('show-solution');
        if (this.params.behaviour.enableRetry) {
          this.showButton('try-again');
        }
        break;

      default:
        break;
    }
  }

  /**
   * Register DOM elements via H5P.Question, called automatically.
   */
  registerDomElements() {
    const introduction = document.createElement('div');
    introduction.classList.add('task-description');
    introduction.id = this.introductionId;
    if (!this.params.taskDescription) {
      introduction.classList.add('screen-reader-only');
    }

    const taskDescription = this.params.taskDescription || this.introductionFallback;
    introduction.innerHTML = taskDescription;

    this.setIntroduction(introduction);

    this.setContent(this.main.getDOM());

    this.addQuestionButtons();

    if (Object.keys(this.previousState).length) {
      this.setCurrentState(this.previousState);
    }
  }

  /**
   * Add question buttons via H5P.Question.
   */
  addQuestionButtons() {
    this.addButton(
      'check-answer',
      this.dictionary.get('l10n.check'),
      () => {
        this.checkAnswers();
      },
      this.params.behaviour.enableCheckButton,
      { 'aria-label': this.dictionary.get('a11y.check') },
      {
        contentData: this.contentData,
        textIfSubmitting: this.dictionary.get('l10n.submit'),
        icon: 'check',
      },
    );

    this.addButton(
      'show-solution',
      this.dictionary.get('l10n.showSolution'),
      () => {
        this.showSolution();
      },
      false,
      { 'aria-label': this.dictionary.get('a11y.showSolution') },
      {
        styleType: 'secondary',
        icon: 'show-solutions',
      },
    );

    this.addButton(
      'try-again',
      this.dictionary.get('l10n.retry'),
      () => {
        this.reset();
      },
      false,
      { 'aria-label': this.dictionary.get('a11y.retry') },
      {
        styleType: 'secondary',
        icon: 'retry',
      },
    );
  }

  /**
   * Check answers, e.g. when user clicks "Check" button.
   * @param {object} params Parameters.
   * @param {boolean} [params.skipXAPI] Whether to skip triggering xAPI event. Required for programmatic checks.
   */
  checkAnswers(params = {}) {
    this.setViewState(VIEW_STATES.results);
    this.showEvaluation();

    if (!params.skipXAPI) {
      this.triggerXAPICompleted();
    }

    window.setTimeout(() => {
      this.trigger('resize');
    }, SHOW_FEEDBACK_DELAY_MS);
  }

  /**
   * Handle user completed the task.
   */
  triggerXAPICompleted() {
    this.trigger(this.createXAPIEvent('completed'));
  }

  /**
   * Show evaluation.
   */
  showEvaluation() {
    this.main.showEvaluation();

    const score = this.getScore();
    const maxScore = this.getMaxScore();

    const scoreText = H5P.Question.determineOverallFeedback(this.params.overallFeedback, score / maxScore)
      .replace('@score', score)
      .replace('@total', maxScore);

    const ariaScoreText = this.dictionary.get('a11y.scoreText')
      .replace('@score', ':num')
      .replace('@total', ':total');

    this.setFeedback(scoreText, score, maxScore, ariaScoreText);

    window.requestAnimationFrame(() => {
      this.trigger('resize');
    });
  }

  /**
   * Show solution. Not to be confused with showSolutions() from QuestionTypeContract.
   */
  showSolution() {
    if (!this.params.behaviour.enableSolutionsButton) {
      return;
    }

    this.showSolutions();
    this.setViewState(VIEW_STATES.solutions);
  }

  /**
   * Reset the task.
   */
  reset() {
    this.contentWasReset = true;
    if (this.isRoot()) {
      this.setActivityStarted();
    }

    this.main.reset();
    this.main.enable();

    this.removeFeedback();

    this.setViewState(VIEW_STATES.task);
  }
}
