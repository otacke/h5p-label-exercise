import Label from '@components/labels-area/label/label.js';
import { extend } from '@services/util.js';
import './text.scss';

export default class Text extends Label {
  constructor(params, callbacks) {
    super(params, callbacks);

    this.instancePlaceholder = document.createElement('div');
    this.dom.append(this.instancePlaceholder);

    this.updateInstance(params);
  }

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
