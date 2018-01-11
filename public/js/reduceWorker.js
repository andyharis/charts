onmessage = function ({data}) {
  console.time('Formatting data (Web worker thread).')
  let yearsKeys = {};
  let nextYearIndex = 0;
  const updateKeys = ([year, month], data, result) => {
    const getKey = () => `${year}-${month}`;
    // We will store all data by key Year
    if (!yearsKeys[year]) {
      const formattedYear = {
        year,
        value: 0,
        months: {}
      };
      // making links to loop once
      result[nextYearIndex++] = formattedYear;
      yearsKeys[year] = formattedYear;
    }
    // adding months too, so we can add in db them later
    // probably we need to make some optimization here
    // when data is already in db, so we don't need
    // to make this calculations
    if (!yearsKeys[year].months[getKey()]) {
      yearsKeys[year].months[getKey()] = {
        month,
        value: 0,
      };
    }
    // sum everything we need
    const value = parseFloat(data.v)
    yearsKeys[year].value += value;
    yearsKeys[year].months[getKey()].value += value;
    return result;
  };
  const formattedData = data.reduce(function (final, current) {
    if (!current.t)
      return final;
    return updateKeys(current.t.split('-'), current, final);
  }, []);
  console.timeEnd('Formatting data (Web worker thread).')
  postMessage(formattedData);
}