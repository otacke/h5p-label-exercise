import Label from '@components/labels-area/label/label.js';
import { extend } from '@services/util.js';
import './text.scss';

export default class Text extends Label {
  /**
   * @param {object} [params] Parameters.
   * @param {number} params.contentId Content ID for rendering H5P instances.
   * @param {object} [params.text] H5P.AdvancedText library params.
   * @param {object} [callbacks] Callbacks.
   */
  constructor(params, callbacks) {
    super(params, callbacks);

    this.instancePlaceholder = document.createElement('div');
    if (this.params.backgroundColor) {
      this.instancePlaceholder.style.setProperty('--background-color', this.params.backgroundColor);
    }
    this.dom.append(this.instancePlaceholder);

    this.updateInstance(params);
  }

  /**
   * Create or replace the H5P.AdvancedText instance.
   * @param {object} [params] Parameters.
   * @param {object} [params.text] H5P.AdvancedText library params.
   */
  updateInstance(params = {}) {
    params.text = extend({
      library: 'H5P.AdvancedText 1.1',
      params: {},
    }, params.text ?? {});

    const instance = H5P.newRunnable(
      params.text,
      this.params.contentId,
      H5P.jQuery(this.instancePlaceholder),
      false,
    );
  }
}
