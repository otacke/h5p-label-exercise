import { DEFAULT_DESCRIPTION } from '@services/constants.js';
import { extend, splitSolutionString } from '@services/util.js';

/** @constant {string} XAPI_BLANK_PLACEHOLDER Placeholder for H5P's reporting library. */
const XAPI_BLANK_PLACEHOLDER = '__________';

/**
 * Mixin containing methods for xapi stuff.
 */
export default class XAPI {
  /**
   * Create an xAPI event.
   * @param {string} verb Short id of the verb to be triggered.
   * @returns {H5P.XAPIEvent} Event template.
   */
  createXAPIEvent(verb) {
    const xAPIEvent = this.createXAPIEventTemplate(verb);

    extend(
      xAPIEvent.getVerifiedStatementValue(['object', 'definition']),
      this.getXAPIDefinition(),
    );

    if (verb === 'completed' || verb === 'answered') {
      const score = this.getScore();
      const maxScore = this.getMaxScore();

      xAPIEvent.setScoredResult(
        score,
        maxScore,
        this,
        true, // Completed
        score >= maxScore, // Success
      );

      const result = xAPIEvent.getVerifiedStatementValue(['result']);
      result.response = this.main.getXAPIResponse();

      if (this.hasAlternatives) {
        const context = xAPIEvent.getVerifiedStatementValue(['context']);
        context.extensions = context.extensions || {};
        context.extensions['https://h5p.org/x-api/h5p-reporting-version'] = '1.1.0';
      }
    }

    return xAPIEvent;
  }

  /**
   * Get the xAPI definition for the xAPI object.
   * @returns {object} XAPI definition.
   */
  getXAPIDefinition() {
    const definition = {};

    definition.name = {};
    definition.name[this.languageTag] = this.getTitle();
    // Fallback for h5p-php-reporting, expects en-US
    definition.name['en-US'] = definition.name[this.languageTag];

    definition.description = definition.description || {};
    definition.description[this.languageTag] = this.getDescription();
    // Fallback for h5p-php-reporting, expects en-US
    definition.description['en-US'] = definition.description[this.languageTag];

    definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
    definition.interactionType = 'fill-in';

    /*
     * This CRP is technically not correct, as xAPI expects it to contain all possible
     * combinations. But computing these leads to a combinatorial explosion when multiple
     * labels have multiple alternatives. H5P Group therefore just sends the first alternative and
     * uses the https://h5p.org/x-api/alternatives extension to send all alternatives.
     */
    const firstSolutions = this.params.labelEditor.labels
      .map((label) => splitSolutionString(label.solutions)[0])
      .join('[,]');

    const caseMattersPrefix = `{case_matters=${this.params.behaviour.caseSensitive.toString()}}`;

    definition.correctResponsesPattern = [`${caseMattersPrefix}${firstSolutions}`];
    definition.extensions = definition.extensions || {};
    definition.extensions['https://h5p.org/x-api/alternatives'] =
      this.params.labelEditor.labels.map((label) => splitSolutionString(label.solutions));
    definition.extensions['https://h5p.org/x-api/case-sensitivity'] = true;

    return definition;
  }

  /**
   * Get task title.
   * @returns {string} Title.
   */
  getTitle() {
    return H5P.createTitle(
      this.params?.headline || this.extras?.metadata?.title || DEFAULT_DESCRIPTION,
    );
  }

  /**
   * Get description.
   * @returns {string} Description.
   */
  getDescription() {
    const description = this.params?.taskDescription || DEFAULT_DESCRIPTION;

    const intro = `<p>${description}</p>`.replaceAll(/_{10,}/gi, '_________');

    const itemsString = this.params.labelEditor.labels
      .map((label) => {
        const solution = splitSolutionString(label.solutions).join('/');
        return `<p>${solution}: ${XAPI_BLANK_PLACEHOLDER}</p>`;
      })
      .join('');

    return `${intro}${itemsString}`;
  }
}
