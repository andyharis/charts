// we need to import our Database class
importScripts('/js/db.js');
onmessage = function ({data: {data, table}}) {
  console.time('Inserting in DB (Web worker thread).');
  const DBFactory = new Database();
  let needToInsert = data.length;
  let inserted = 0;
  DBFactory.connect(function (DBInstance) {
    const query = DBInstance.find(table);
    for (let year of data) {
      for (let monthKey in year.months) {
        const month = year.months[monthKey];
        // insert each month
        query.insert({t: monthKey, v: month.value}, handleInsert);
      }
    }
  });

  function handleInsert(e) {
    inserted++;
    if (inserted === needToInsert) {
      console.timeEnd('Inserting in DB (Web worker thread).');
      postMessage('good')
    }
  }
}