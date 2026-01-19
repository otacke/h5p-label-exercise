import Background from '@components/background.js';
import FullscreenButton from '@components/fullscreen-button.js';
import LabelsArea from '@components/labels-area/labels-area.js';
import HotspotsArea from '@components/hotspots-area/hotspots-area.js';
import ResultScreen from '@components/result-screen/result-screen.js';
import OverlayDialog from './overlay-dialog.js';
import { callOnceVisible, extend } from '@services/util.js';
import './main.scss';

export default class Main {

  /**
   * @class
   * @param {object} params Parameters.
   * @param {object} callbacks Callbacks.
   * @param {function} callbacks.onContentVisible Called when content is visible.
   * @param {function} callbacks.onInteracted Called when user interacts with the content.
   * @param {function} callbacks.onToggleFullscreen Called when user toggles fullscreen.
   * @param {function} callbacks.onRead Called when there is an aria message to read.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = extend({}, params);

    this.callbacks = extend({
      onContentVisible: () => {},
      onInteracted: () => {},
      onToggleFullscreen: () => {},
      onRead: () => {},
    }, callbacks);

    this.taskMode = true;

    this.dom = this.buildDOM();

    callOnceVisible(this.dom, () => {
      this.container = this.dom.closest('.h5p-container');
      this.callbacks.onContentVisible(this.container);
    });
  }

  /**
   * Build main DOM structure.
   * @returns {HTMLElement} Main DOM element.
   */
  buildDOM() {
    const dom = document.createElement('div');
    dom.classList.add('h5p-label-exercise-main');

    // Fullscreen button
    if (this.params.fullscreenAllowed) {
      this.fullscreenButton = new FullscreenButton(
        { dictionary: this.params.dictionary },
        {
          onClick: () => {
            this.callbacks.onToggleFullscreen();
          },
        },
      );
      dom.append(this.fullscreenButton.getDOM());
    }

    // Background
    this.background = new Background({
      backgroundImage: this.params.backgroundImage,
      contentId: this.params.contentId,
    });
    dom.append(this.background.getDOM());

    // Labels area
    this.labelsArea = new LabelsArea(
      {
        labels: this.params.labels,
        introductionId: this.params.introductionId,
        dictionary: this.params.dictionary,
        hotspotDisplay: this.params.behaviour.hotspotDisplay,
      },
      {
        onInteracted: () => {
          this.callbacks.onInteracted();
        },
      },
    );
    dom.append(this.labelsArea.getDOM());

    if (this.params.behaviour.hotspotDisplay === 'always') {
      this.labelsArea.toggleVisibility(false);
    }

    // Hotspots area, alternative to labels on smaller screens
    this.hotspotsArea = new HotspotsArea(
      {
        labels: this.params.labels,
        introductionId: this.params.introductionId,
        dictionary: this.params.dictionary,
        hotspotDisplay: this.params.behaviour.hotspotDisplay,
      },
      {
        onHotspotClicked: (index) => {
          this.handleHotspotClicked(index);
        },
      },
    );
    dom.append(this.hotspotsArea.getDOM());

    // Overlay dialog, used when hotspots are showing
    this.overlayDialog = new OverlayDialog(
      { dictionary: this.params.dictionary },
      {
        onClosed: () => {
          this.handleOverlayClosed();
        },
      },
    );
    dom.append(this.overlayDialog.getDOM());

    // Result screen, used to show results, solutions, etc. when hotspots are showing
    this.resultScreen = new ResultScreen(
      {
        dictionary: this.params.dictionary,
        enableSolutionsButton: this.params.behaviour.enableSolutionsButton,
        enableRetryButton: this.params.behaviour.enableRetry,
      },
      {
        onVisibilityChanged: (ariaMessage) => {
          this.callbacks.onRead(ariaMessage);
        },
      },
    );
    dom.append(this.resultScreen.getDOM());

    return dom;
  }

  /**
   * Handle hotspot clicked.
   * @param {number} index Index of clicked hotspot.
   */
  handleHotspotClicked(index) {
    const total = this.params.labels.length;
    const title = this.params.dictionary.get('l10n.labelXOfY')
      .replaceAll('@current', index + 1)
      .replaceAll('@total', total);
    this.overlayDialog.setTitle(title);

    const label = this.labelsArea.getLabelByIndex(index);
    label.toggleListItemRole(false);
    this.overlayDialog.setContent(label.getDOM());

    this.overlayDialog.show();
  }

  /**
   * Handle overlay closed.
   */
  handleOverlayClosed() {
    this.overlayDialog.hide();
    this.labelsArea.reclaimLabels();
  }

  /**
   * Disable interaction with labels or hotspots.
   */
  disable() {
    this.labelsArea.disable();
    this.hotspotsArea.disable();
  }

  /**
   * Enable interaction with labels or hotspots.
   */
  enable() {
    this.labelsArea.enable();
    this.hotspotsArea.enable();
  }

  /**
   * Determine whether the task was answered already.
   * @returns {boolean} True if answer was given by user, else false.
   */
  getAnswerGiven() {
    return this.labelsArea.getAnswerGiven();
  }

  /**
   * Get current state.
   * @returns {object} Current state to be retrieved later.
   */
  getCurrentState() {
    return { labelsArea: this.labelsArea.getCurrentState() };
  }

  /**
   * Get main DOM element.
   * @returns {HTMLElement} Main DOM element.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Get maximum possible score.
   * @returns {number} Maximum possible score.
   */
  getMaxScore() {
    return this.labelsArea.getMaxScore();
  }

  /**
   * Get current score.
   * @returns {number} Current score.
   */
  getScore() {
    return this.labelsArea.getScore();
  }

  /**
   * Get xAPI response.
   * @returns {string} XAPI response.
   */
  getXAPIResponse() {
    return this.labelsArea.getXAPIResponse();
  }

  /**
   * Hide evaluation.
   */
  hideEvaluation() {
    this.labelsArea.hideEvaluation();
  }

  /**
   * Reset the task.
   */
  reset() {
    this.taskMode = true;

    this.overlayDialog.hide();
    this.labelsArea.reset();
    this.hotspotsArea.reset();
    this.toggleResultScreen(false);

    delete this.wasAnswerGiven;
    delete this.isShowingHotspots;
  }

  /**
   * Toggle result screen visibility.
   * @param {boolean} isVisible Whether the result screen should be visible.
   */
  toggleResultScreen(isVisible) {
    this.fullscreenButton?.toggleVisibility(!isVisible);
    this.background.toggleVisibility(!isVisible);

    this.labelsArea.toggleVisibility(!isVisible && !this.isShowingHotspots);
    this.hotspotsArea.toggleVisibility(!isVisible && this.isShowingHotspots);

    if (isVisible && this.overlayDialog.isShowing()) {
      this.overlayDialog.hide();
      this.labelsArea.reclaimLabels();
    }

    this.container?.querySelector('.h5p-question-introduction')?.classList.toggle('display-none', isVisible);
    this.container?.querySelector('.h5p-question-content')?.classList.toggle('padding-block', isVisible);

    window.requestAnimationFrame(() => {
      this.resultScreen.toggleVisibility(isVisible);
    });
  }

  /**
   * Set current state.
   * @param {object} state State to set.
   */
  setCurrentState(state = {}) {
    this.labelsArea.setCurrentState(state.labelsArea);
  }

  /**
   * Toggle hotspot visibility.
   * @param {boolean} showHotspots Whether to show hotspots.
   */
  toggleHotspotVisibility(showHotspots) {
    if (this.params.behaviour.hotspotDisplay === 'always') {
      showHotspots = true;
    }

    if (this.isShowingHotspots === showHotspots) {
      return;
    }
    this.isShowingHotspots = showHotspots;

    this.labelsArea.toggleVisibility(!this.isShowingHotspots);
    this.hotspotsArea.toggleVisibility(this.isShowingHotspots);

    if (this.overlayDialog.isShowing()) {
      this.overlayDialog.hide();
      this.labelsArea.reclaimLabels();
    }

    this.toggleResultScreen(this.isShowingHotspots && !this.taskMode);
  }

  /**
   * Show evaluation.
   */
  showEvaluation() {
    const evaluation = this.labelsArea.getEvaluation();
    this.resultScreen.setResults({ evaluation, showSolutions: false });

    this.disable();
    this.labelsArea.showEvaluation();

    this.taskMode = false;

    this.toggleResultScreen(this.isShowingHotspots);
  }

  /**
   * Show solutions.
   */
  showSolutions() {
    this.overlayDialog.setTitle('Solutions');
    this.labelsArea.showSolutions();
    this.taskMode = false;

    const evaluation = this.labelsArea.getEvaluation();
    this.resultScreen.setResults({ evaluation, showSolutions: true });

    this.toggleResultScreen(this.isShowingHotspots);
  }

  /**
   * Toggle fullscreen mode.
   * @param {boolean} isFullscreen Whether fullscreen mode is active.
   */
  toggleFullscreenMode(isFullscreen) {
    this.fullscreenButton.setFullscreenState(isFullscreen);
  }
}
