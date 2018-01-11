function api(url) {
  return fetch(url)
    .then(convertToJson)
    .then(getOnlyData)
    .catch(handleErrors);

  function convertToJson(result) {
    return result.json();
  }

  function getOnlyData(result) {
    return result.data;
  }

  function handleErrors(errors) {
    return errors;
  }

}

function fetchCharts(chart) {
  return api(`/api/${chart}`);
}
