import Telemetry from '@models/telemetry.js';
import { extend } from '@services/util.js';
import './hotspot.scss';

/** @constant {Map<string, string>} HOTSPOT_ANCHOR_POSITIONS Possible hotspot anchor positions. */
const HOTSPOT_ANCHOR_POSITIONS = new Map([
  ['left', 'left'],
  ['right', 'right'],
]);

export default class Hotspot {
  /**
   * Create instance of Hotspot.
   * @param {object} [params] Parameters for hotspot.
   * @param {object} params.telemetry Telemetry data.
   * @param {string} [params.hotspotAnchorPosition] Hotspot anchor position.
   * @param {object} [callbacks] Callback functions.
   * @param {function} [callbacks.onClicked] Callback on click.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = extend({}, params);

    this.callbacks = extend({
      onClicked: () => {},
    }, callbacks);

    this.telemetry = new Telemetry(this.params.telemetry);

    this.hotspotAnchorPosition = HOTSPOT_ANCHOR_POSITIONS.get(this.params.hotspotAnchorPosition);

    this.dom = this.buildDOM();
  }

  /**
   * Build DOM element for hotspot.
   * @returns {HTMLElement} DOM element for hotspot.
   */
  buildDOM() {
    const dom = document.createElement('li');
    dom.classList.add('h5p-label-exercise-hotspot-list-item');

    this.button = document.createElement('button');
    this.button.classList.add('h5p-label-exercise-hotspot');
    this.button.style.setProperty('--left', `${this.telemetry.getXAsString()}%`);
    this.button.style.setProperty('--top', `${this.telemetry.getYAsString()}%`);
    this.button.style.setProperty('--label-width', `${this.telemetry.getWidthAsString()}%`);

    // Assume that the thing that the label relates to is where there's more space next to the label.
    if (!this.hotspotAnchorPosition) {
      const spaceLeft = this.telemetry.getX();
      const spaceRight = 100 - (this.telemetry.getX() + this.telemetry.getWidth());
      this.hotspotAnchorPosition = spaceLeft > spaceRight ? 'left' : 'right';
    }
    this.button.classList.add(HOTSPOT_ANCHOR_POSITIONS.get(this.hotspotAnchorPosition));

    this.button.addEventListener('click', () => {
      this.callbacks.onClicked();
    });

    dom.append(this.button);

    return dom;
  }

  /**
   * Disable hotspot.
   */
  disable() {
    this.button.disabled = true;
  }

  /**
   * Enable hotspot.
   */
  enable() {
    this.button.disabled = false;
  }

  /**
   * Get DOM element for hotspot.
   * @returns {HTMLElement} DOM element for hotspot.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Hide hotspot.
   */
  hide() {
    this.dom.classList.add('display-none');
  }

  /**
   * Show hotspot.
   */
  show() {
    this.dom.classList.remove('display-none');
  }
};
