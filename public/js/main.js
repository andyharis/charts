(function () {
  if (!('onhashchange' in window)) {
    return document.body.innerText = 'Your browser is so Old, so it\'s Imposibru to show you anything here!';
  }
  console.time('Initialising app.');
  const DBFactory = new Database();
  let ChartInstance = null;
  let DBInstance = null;
  const defaultChart = 'temperature';
  const getCurrentChart = () => location.hash.replace('#', '') || defaultChart;

  /**
   * Initialize canvas update
   *
   * @param formattedData
   */
  function updateCanvas(formattedData) {
    checkSelectYear(formattedData);
    updateChart(formattedData);
  }

  /**
   * Getting data and renders chart
   *
   * @param formattedData
   */
  function updateChart(formattedData) {
    const finalData = filterCharts(formattedData);
    if (ChartInstance)
      return ChartInstance.update(finalData);
    ChartInstance = new Chart('chart', finalData);
  }

  /**
   * Gets all data for chart and triggers callback to update canvas.
   *
   * @param chart
   * @param cb callback on success
   */
  function getChart(chart, cb) {
    console.time('Fetching data.');
    DBInstance.find(chart).all(function (data) {
      const isFromDB = data.length > 0;
      const fetchedData = isFromDB ? Promise.resolve(data) : fetchCharts(chart);
      fetchedData.then((data) => {
        console.timeEnd('Fetching data.');
        return new Promise((resolve) => {
          /**
           * Resolves data and saves into db if needed
           *
           * @param formattedData
           */
          function resolveFormattedData(formattedData) {
            if (!isFromDB) {
              saveDataIntoDB(formattedData, chart);
            }
            console.info(`Fetching from ${isFromDB ? 'DB' : 'API'}`);
            resolve(formattedData);
          }

          prepareData(data, resolveFormattedData);
        });
      }).then(cb);
    });
  }

  /**
   * Starts app.
   *
   * @param chart
   */
  function renderChart(chart) {
    console.timeEnd('Initialising app.');
    getChart(chart, updateCanvas);
  }

  DBFactory.connect(function (db) {
    DBInstance = db;
    // waiting for haschange event to update chart
    window.addEventListener('hashchange', function () {
      renderChart(getCurrentChart());
    });
    // waiting for select-onChange event to update chart
    window.addEventListener('change', function (e) {
      if (e.target.type === 'select-one')
        getChart(getCurrentChart(), function (data) {
          updateChart(data);
        });
    });
    // initialising
    renderChart(getCurrentChart());
  });
})();
