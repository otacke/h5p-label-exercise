import Hotspot from './hotspot.js';
import { extend } from '@services/util.js';
import './hotspots-area.scss';

export default class HotspotsArea {
  /**
   * @param {object} [params] Parameters for hotspots area.
   * @param {object[]} [params.labels] Label parameters.
   * @param {string} params.introductionId Introduction element id.
   * @param {object} [callbacks] Callback functions.
   * @param {function} [callbacks.onHotspotClicked] Callback on hotspot click.
   * @param {function} [callbacks.onInteracted] Callback on interaction.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = extend({
      labels: [],
    }, params);

    this.callbacks = extend({
      onHotspotClicked: () => {},
      onInteracted: () => {},
    }, callbacks);

    this.hotspots = this.params.labels.map((labelParams, index) => {
      return new Hotspot(
        labelParams,
        {
          onClicked: () => {
            this.callbacks.onHotspotClicked(index);
          },
        },
      );
    });

    this.dom = this.buildDOM();
  }

  /**
   * Build DOM element for hotspots area.
   * @returns {HTMLElement} DOM element for hotspots area.
   */
  buildDOM() {
    const dom = document.createElement('ul');
    dom.setAttribute('aria-labelledby', this.params.introductionId);
    dom.classList.add('h5p-label-exercise-hotspots-area');

    this.hotspots.forEach((hotspot) => {
      dom.append(hotspot.getDOM());
    });

    return dom;
  }

  /**
   * Disable hotspots.
   */
  disable() {
    this.hotspots.forEach((hotspot) => {
      hotspot.disable();
    });
  }

  /**
   * Enable hotspots.
   */
  enable() {
    this.hotspots.forEach((hotspot) => {
      hotspot.enable();
    });
  }

  /**
   * Get DOM element for hotspots area.
   * @returns {HTMLElement} DOM element for hotspots area.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Reset hotspots area.
   */
  reset() {
    this.enable();
  }

  /**
   * Toggle visibility state.
   * @param {boolean} isVisible Visibility state.
   */
  toggleVisibility(isVisible) {
    this.dom.classList.toggle('display-none', !isVisible);
  }
}
