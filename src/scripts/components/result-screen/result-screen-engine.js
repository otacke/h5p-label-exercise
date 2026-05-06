/*
 * Temporary copy of ResultScreen component from H5P.Components.
 * Renamed stylesheet classes to avoid conflicts.
 * I need to ship this before the theming feature is available and don't want users
 * to get a different result screen.
 */
import './result-screen-engine.scss';

/**
 * Create HTML element.
 * @param {string} tag Tag name.
 * @param {object} options Element options.
 * @param {object} style CSS styles.
 * @returns {HTMLElement} Created element.
 */
const createElement = (tag, options, style = {}) => {
  const element = Object.assign(document.createElement(tag), options);
  Object.assign(element.style, style);

  return element;
};

/**
 * @typedef ResultQuestion
 * @type {object}
 * @property {[string]} imgUrl The url to an image to display before the question
 * @property {[boolean]} useDefaultImg Use a default image. Will be overwritten by imgUrl
 * @property {string} title The textual description of the question
 * @property {string} points The score of the question
 * @property {[boolean]} isCorrect If the answer is correct (Some content types are more lenient)
 * @property {[string]} userAnswer What the user answered
 * @property {[string]} correctAnswer The correct answer
 * @property {[string]} correctAnswerPrepend The label before the correct answer
 */

/**
 * @typedef ResultQuestionGroup
 * @type {object}
 * @property {[string[]]} listHeaders The table headers
 * @property {ResultQuestion[]} questions The list of tasks to be summarized
 */

/**
 * @typedef ResultScreenParams
 * @type {object}
 * @property {string} header The main header of the result screen
 * @property {string} scoreHeader The header detailing the total score
 * @property {ResultQuestionGroup[]} questionGroups The groups of questions
 */

/**
 * Create a result screen, summing up the tasks of the content and the scores achieved
 * @param {ResultScreenParams} params A set of parameters to configure the ResultScreen component
 * @returns {HTMLElement} The result screen element
 */
function ResultScreen(params) {
  // Create main wrapper
  const resultScreen = createElement('div', { classList: 'h5p-label-exercise-result-screen' });

  // Create header banner
  const header = createElement('div', { classList: 'h5p-label-exercise-results-banner' });
  header.appendChild(createElement('div', { classList: 'h5p-label-exercise-pattern' }));
  header.appendChild(createElement('div', {
    classList: 'h5p-label-exercise-results-title',
    textContent: params.header,
  }));
  header.appendChild(createElement('div', {
    classList: 'h5p-label-exercise-results-score',
    innerHTML: params.scoreHeader,
  }));
  resultScreen.append(header);

  // Create the summary table
  params.questionGroups.forEach((group) => {
    const groupContainer = createElement('div', {
      classList: 'h5p-label-exercise-results-list-container',
    });

    if (group.listHeaders) {
      const listHeaders = createElement('div', { classList: 'h5p-label-exercise-results-list-heading' });
      group.listHeaders.forEach((title) => {
        listHeaders.appendChild(createElement('div', { classList: 'heading-item', textContent: title }));
      });
      groupContainer.appendChild(listHeaders);
    }

    const resultList = createElement('ul', { classList: 'h5p-label-exercise-results-list' });

    group.questions.forEach((question) => {
      resultList.appendChild(createQuestion(question));
    });

    groupContainer.appendChild(resultList);
    resultScreen.appendChild(groupContainer);
  });

  return resultScreen;
}

/**
 * Create a list item element summarizing a single question result.
 * @param {ResultQuestion} question Question result data.
 * @returns {HTMLElement} List item element.
 */
const createQuestion = (question) => {
  const listItem = createElement('li', {
    classList: 'h5p-label-exercise-results-list-item',
  });

  const questionContainer = createElement('div', {
    classList: 'h5p-label-exercise-results-question-container',
  });

  questionContainer.appendChild(createElement('div', {
    classList: 'h5p-label-exercise-results-question',
    innerHTML: question.title,
  }));

  // UserAnswer might be an empty string
  if (typeof (question.userAnswer) === 'string') {
    const answerContainer = createElement('div', {
      classList: 'h5p-label-exercise-results-answer',
    });

    const answer = createElement('span', {
      classList: 'h5p-label-exercise-results-box-small h5p-label-exercise-results-correct',
      textContent: question.userAnswer,
    });
    answerContainer.appendChild(answer);

    // isCorrect defined AND false
    if (question.isCorrect === false) {
      answer.classList.add('h5p-label-exercise-results-incorrect');
      answer.classList.remove('h5p-label-exercise-results-correct');

      if (question.correctAnswer) {
        const solutionContainer = createElement('span', {
          classList: 'h5p-label-exercise-results-solution',
        });

        if (question.correctAnswerPrepend) {
          solutionContainer.appendChild(createElement('span', {
            classList: 'h5p-label-exercise-results-solution-label',
            textContent: question.correctAnswerPrepend,
          }));
        }

        solutionContainer.innerHTML += question.correctAnswer;

        answerContainer.appendChild(solutionContainer);
      }
    }

    questionContainer.appendChild(answerContainer);
  }

  listItem.appendChild(questionContainer);

  listItem.appendChild(createElement('div', {
    classList: 'h5p-label-exercise-results-points',
    innerHTML: question.points,
  }));

  return listItem;
};

export default ResultScreen;
