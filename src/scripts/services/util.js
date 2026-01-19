import { decode } from 'he';

/**
 * Add mixins to a class, useful for splitting files.
 * @param {object} [master] Master class to add mixins to.
 * @param {object[]|object} [mixins] Mixins to be added to master.
 */
export const addMixins = (master = {}, mixins = []) => {
  if (!master.prototype) {
    throw new Error('Master must be a class or function with a prototype');
  }

  if (!Array.isArray(mixins)) {
    mixins = [mixins];
  }

  const masterPrototype = master.prototype;

  mixins.forEach((mixin) => {
    const mixinPrototype = mixin.prototype;
    Object.getOwnPropertyNames(mixinPrototype).forEach((property) => {
      if (property === 'constructor') {
        return; // Don't need constructor
      }

      if (Object.getOwnPropertyNames(masterPrototype).includes(property)) {
        return; // property already present, do not override
      }

      masterPrototype[property] = mixinPrototype[property];
    });
  });
};

/**
 * Extend an array just like JQuery's extend.
 * @param {...object} args Objects to merge.
 * @returns {object} Merged objects.
 */
export const extend = (...args) => {
  for (let i = 1; i < args.length; i++) {
    for (let key in args[i]) {
      if (Object.prototype.hasOwnProperty.call(args[i], key)) {
        if (typeof args[0][key] === 'object' && typeof args[i][key] === 'object') {
          extend(args[0][key], args[i][key]);
        }
        else if (args[i][key] !== undefined) {
          args[0][key] = args[i][key];
        }
      }
    }
  }

  return args[0];
};

/**
 * Format language tag (RFC 5646). Assuming "language-coutry". No validation.
 * Cmp. https://tools.ietf.org/html/rfc5646
 * @param {string} languageCode Language tag.
 * @returns {string} Formatted language tag.
 * @throws {Error} When language code is not a string.
 */
export const formatLanguageCode = (languageCode) => {
  if (typeof languageCode !== 'string') {
    throw new Error('Language code must be a string');
  }

  /*
   * RFC 5646 states that language tags are case insensitive, but
   * recommendations may be followed to improve human interpretation
   */
  const segments = languageCode.split('-');
  segments[0] = segments[0].toLowerCase(); // ISO 639 recommendation
  if (segments.length > 1) {
    segments[1] = segments[1].toUpperCase(); // ISO 3166-1 recommendation
  }
  languageCode = segments.join('-');

  return languageCode;
};

/**
 * Call callback function once dom element gets visible in viewport.
 * @async
 * @param {HTMLElement} dom DOM element to wait for.
 * @param {function} callback Function to call once DOM element is visible.
 * @param {object} [options] IntersectionObserver options.
 * @returns {IntersectionObserver} Promise for IntersectionObserver.
 */
export const callOnceVisible = async (dom, callback, options = {}) => {
  if (typeof dom !== 'object' || typeof callback !== 'function') {
    return; // Invalid arguments
  }

  options.threshold = options.threshold || 0;

  return await new Promise((resolve) => {
    // iOS is behind ... Again ...
    const idleCallback = window.requestIdleCallback ?
      window.requestIdleCallback :
      window.requestAnimationFrame;

    idleCallback(() => {
      // Get started once visible and ready
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          observer.unobserve(dom);
          observer.disconnect();

          callback();
        }
      }, {
        ...(options.root && { root: options.root }),
        threshold: options.threshold,
      });
      observer.observe(dom);

      resolve(observer);
    });
  });
};

/**
 * Split solution string into array of solutions.
 * Uses unescaped slashes as separators and may contain escaped slashes.
 * @param {string} solutionString Solution string.
 * @returns {string[]} Array of solutions.
 */
export const splitSolutionString = (solutionString) => {
  return solutionString.split(/(?<!\\)\//).map((solution) => solution.replace(/\\\//g, '/').trim());
};

/**
 * Clamp a value between min and max.
 * @param {number} value Value to clamp.
 * @param {number} min Minimum value.
 * @param {number} max Maximum value.
 * @returns {number} Clamped value.
 */
export const clamp = (value, min = 0, max = 100) => Math.min(Math.max(min, value), max);

/**
 * Parse float with fallback.
 * @param {string} value Value to parse.
 * @param {number} fallback Fallback value.
 * @returns {number} Parsed float or fallback.
 */
export const parseFloatWithFallback = (value, fallback = 0) => {
  const parsed = parseFloat(value);

  return isNaN(parsed) ? fallback : parsed;
};

/**
 * HTML decode and strip HTML.
 * @param {string|object} html html.
 * @returns {string} html value.
 */
export const purifyHTML = (html) => {
  if (typeof html !== 'string') {
    return '';
  }

  let text = decode(html);
  const div = document.createElement('div');
  div.innerHTML = text;
  text = div.textContent || div.innerText || '';

  return text;
};
