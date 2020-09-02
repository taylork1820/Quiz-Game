  // categories is the main data structure for the app; it looks like this:

  //  [
  //    { title: "Math",
  //      clues: [
  //        {question: "2+2", answer: 4, showing: null},
  //        {question: "1+1", answer: 2, showing: null}
  //        ...
  //      ],
  //    },
  //    { title: "Literature",
  //      clues: [
  //        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
  //        {question: "Bell Jar Author", answer: "Plath", showing: null},
  //        ...
  //      ],
  //    },
  //    ...
  //  ]
  const apiUrl = "https://jservice.io/api/";
  const numOfCategories = 6;
  const numOfClues = 5;
  let categories = [];

  /** Get NUM_CATEGORIES random category from API.
   *
   * Returns array of category ids
   */
  async function getCategoryIds() {
    //get 100 categories from api
    let results = await axios.get(`${apiUrl}categories?count=100`);
    let categoryIds = results.data.map(val => val.id);
    //use lodash for sampling particular num of items
    return _.sampleSize(categoryIds, numOfCategories);
  };
  /** Return object with data about a category:
   *
   *  Returns { title: "Math", clues: clue-array }
   *
   * Where clue-array is:
   *   [
   *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
   *      {question: "Bell Jar Author", answer: "Plath", showing: null},
   *      ...
   *   ]
   */
  async function getCategory(categoryId) {
    //use api to get category ids randomly with lodash
    let results = await axios.get(`${apiUrl}category?id=${categoryId}`);
    let category = results.data;
    let everyClue = category.clues;
    let randomClues = _.sampleSize(everyClue, numOfClues);
    let clues = randomClues.map(val => ({
      question: val.question,
      answer: val.answer,
      showing: null,
    }));

    return {
      title: category.title,
      clues
    }
  };

  /** Fill the HTML table#jeopardy with the categories & cells for questions.
   *
   * - The <thead> should be filled w/a <tr>, and a <td> for each category
   * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
   *   each with a question for each category in a <td>
   *   (initally, just show a "?" where the question/answer would go.)
   */
  async function fillTable() {
    //make the rows for the category titles
    $("#jeopardy thead").empty();
    let $tr = $("<tr>");
    for (let categoryIdx = 0; categoryIdx < numOfCategories; categoryIdx++) {
      $tr.append($("<th>").text(categories[categoryIdx].title));
    }
    $("#jeopardy thead").append($tr);
    //rows for questions and answers
    $("#jeopardy tbody").empty();
    for (let clueIdx = 0; clueIdx < numOfClues; clueIdx++) {
      let $tr = $("<tr>");
      for (let categoryIdx = 0; categoryIdx < numOfCategories; categoryIdx++) {
        $tr.append($("<td>").attr("id", `${categoryIdx}-${clueIdx}`).text("?"));
      }
      $("#jeopardy tbody").append($tr);
    }
  };
  /** Handle clicking on a clue: show the question or answer.
   *
   * Uses .showing property on clue to determine what to show:
   * - if currently null, show question & set .showing to "question"
   * - if currently "question", show answer & set .showing to "answer"
   * - if currently "answer", ignore click
   * */
  //click once for question and again for clue and if clicked again nothing
  function handleClick(e) {
    let id = e.target.id;
    let [categoryId, clueId] = id.split("-");
    let clue = categories[categoryId].clues[clueId];
    let msg;

    if (!clue.showing) {
      msg = clue.question;
      clue.showing = "question";
    } else if (clue.showing === "question") {
      msg = clue.answer;
      clue.showing = "answer";
    } else {
      return
    }
    $(`#${categoryId}-${clueId}`).html(msg);
  };
  /** Start game:
   *
   * - get random category Ids
   * - get data for each category
   * - create HTML table
   * */

  async function setupAndStart() {
    let categoryIds = await getCategoryIds();

    categories = [];

    for (let categoryId of categoryIds) {
      categories.push(await getCategory(categoryId));
    }
    fillTable();
  };

  /** On click of restart button, restart game. */
  $("#restart").on("click", setupAndStart);
  /** On page load, setup and start & add event handler for clicking clues */
  $(async function () {
    setupAndStart();
    $("#jeopardy").on("click", "td", handleClick);
  });