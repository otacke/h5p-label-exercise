import semantics from '@root/semantics.json';

/**
 * Get default value for a single field.
 * @param {object} field Field object.
 * @returns {object|undefined} Default value or undefined.
 */
const getFieldDefault = (field) => {
  if (typeof field.name !== 'string') {
    return;
  }

  if (typeof field.default !== 'undefined') {
    return field.default;
  }

  if (field.type === 'list') {
    return [];
  }

  if (field.type === 'group' && field.fields) {
    return getSemanticsDefaults(field.fields);
  }

  return;
};

/**
 * Get default values from semantics fields.
 * @param {object[]} start Start semantics field.
 * @returns {object} Default values from semantics.
 */
export const getSemanticsDefaults = (start = semantics) => {
  let defaults = {};

  if (!Array.isArray(start)) {
    return defaults; // Must be array, root or list
  }

  start.forEach((entry) => {
    if (typeof entry.name !== 'string') {
      return;
    }

    if (typeof entry.default !== 'undefined') {
      defaults[entry.name] = entry.default;
    }

    if (entry.type === 'list') {
      defaults[entry.name] = []; // Does not set defaults within list items!
    }
    else if (entry.type === 'group' && entry.fields) {
      // Odd behavior of groups with just one field
      if (entry.fields.length > 1) {
        const groupDefaults = getSemanticsDefaults(entry.fields);
        if (Object.keys(groupDefaults).length) {
          defaults[entry.name] = groupDefaults;
        }
      }
      else {
        const fieldDefault = getFieldDefault(entry.fields[0]);
        if (fieldDefault !== undefined) {
          defaults[entry.name] = fieldDefault;
        }
      }
    }
  });

  return defaults;
};

/**
 * Determine if H5P integration supports theming (best effort).
 * @returns {boolean} True if H5P integration supports theming, false otherwise.
 */
export const isThemingSupported = () => {
  return getComputedStyle(document.documentElement).getPropertyValue('--h5p-theme-main-cta-base') !== '';
};
