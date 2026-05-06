/** @constant {string} Default description */
export const DEFAULT_DESCRIPTION = 'Label Exercise';

/** @constant {string} DEFAULT_LANGUAGE_TAG Default language tag used if not specified in metadata. */
export const DEFAULT_LANGUAGE_TAG = 'en';

/** @constant {object} EVALUATION_STATE Possible evaluation states. */
export const EVALUATION_STATE = Object.freeze({
  CORRECT: 'correct',
  WRONG: 'wrong',
});

/** @constant {object} LABEL_TYPE Label types list. */
export const LABEL_TYPE = Object.freeze({
  BLANK: 'blank',
  DROPDOWN: 'dropdown',
  TEXT: 'text',
});

/** @constant {object} VIEW_STATES View states. */
export const VIEW_STATES = { task: 0, results: 1, solutions: 2 };
