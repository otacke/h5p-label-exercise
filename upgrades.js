var H5PUpgrades = H5PUpgrades || {};

/**
 * Upgrades for the LabelExercise content type.
 */
H5PUpgrades['H5P.LabelExercise'] = (() => {
  return {
    1: {
      /**
       * Asynchronous content upgrade hook.
       * Upgrades content parameters to support LabelExercise 1.1
       * @param {object} parameters Content parameters.
       * @param {function} finished Callback when finished.
       * @param {object} extras Extra parameters such as metadata, etc.
       */
      1: (parameters, finished, extras) => {
        if (Array.isArray(parameters?.labelEditor?.labels)) {
          parameters.labelEditor.labels = parameters.labelEditor.labels.map((label) => {
            label.type = 'blank';
            return label;
          });
        }

        finished(null, parameters, extras);
      },
    },
  };
})();
