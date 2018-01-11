const $ = (el) => document.getElementById(el);
const _$ = (tag) => document.createElement(tag);
const minYearSelect = $('min');
const maxYearSelect = $('max');

/**
 * Checks for how many days in a year
 * @param year
 * @returns {number}
 */
function yearDays(year) {
  const isLeapYear = year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
  return isLeapYear ? 366 : 365;
}

/**
 * Adding select option after data fetched
 *
 * @param data
 */
function updateSelectYears(data) {
  const appendSelectOptions = (select, options) => options.forEach((option) => {
    const element = _$('option');
    element.value = option.year;
    element.innerText = option.year;
    select.appendChild(element);
  });
  // it seems like it is faster to clear everything
  // and then add again
  // TODO disable or remove years from range
  // eg Min = 1900, so Max should be greater than 1900
  const clearSelectOptions = elem => {
    while (elem.firstChild)
      elem.removeChild(elem.firstChild)
  }
  clearSelectOptions(minYearSelect);
  clearSelectOptions(maxYearSelect);
  appendSelectOptions(minYearSelect, data);
  appendSelectOptions(maxYearSelect, data);
}

/**
 * Change select value to max
 *
 * @param data
 */
function selectMaxYear(data) {
  maxYearSelect.value = data[data.length - 1].year;
}

/**
 * Filters data for years range (min-max)
 *
 * @param data
 */
function filterCharts(data) {
  const min = parseInt(minYearSelect.value);
  const max = parseInt(maxYearSelect.value);
  return data.reduce(function (final, current) {
    const currentYear = parseInt(current.year);
    if (currentYear >= min && currentYear <= max)
      final.push(current);
    return final;
  }, []);
}

/**
 * Checks if year is selected
 *
 * @param formattedData
 */
function checkSelectYear(formattedData) {
  updateSelectYears(formattedData);
  selectMaxYear(formattedData);
}

/**
 * Checks if browser supports web workers
 * @returns {boolean}
 */
function checkWorker() {
  if (!window.Worker) {
    alert("You don't have Web Worker! All calculations are in workers threads. So its impossible to show you anything.");
    return false;
  }
  return true;
}

/**
 * Initialize action in Webworker
 * Stores data into DB
 *
 * @param data
 */
function initializeDBWorker(data) {
  if (!checkWorker())
    return;
  const dbWorker = new Worker('/js/dbWorker.js');
  dbWorker.postMessage(data);
  dbWorker.onmessage = function (e) {
    console.log('DB operation:', e.data);
  };
}

/**
 * Initialize action in webworker
 * Loop though all data in separate thread
 * to optimize performance
 *
 * @param data
 * @param cb
 */
function initializeReduceWorker(data, cb) {
  if (!checkWorker())
    return;
  const reduceWorker = new Worker('/js/reduceWorker.js');
  reduceWorker.postMessage(data);
  reduceWorker.onmessage = function (e) {
    cb(e.data);
  };
}