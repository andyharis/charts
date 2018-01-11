const RW = 'readwrite';
const temp = "temperature";
const precip = "precipitation";

// const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// const IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
// const IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

function handleDBError(e) {
  console.error('Something bad happened', e.target);
}

function handleSuccessRequest(e) {
  return e.target.result;
}

function handleSuccess(e) {
  // console.info('Success', e.target.result);
}

function prepareData(data, cb) {
  initializeReduceWorker(data, cb)
}


function saveDataIntoDB(data, table) {
  initializeDBWorker({data, table});
}


class Database {
  constructor(props) {
    this.store = [];
    this.db = null;
    // if (!window.indexedDB) {
    //   return document.body.innerText = "You don't have IndexDB. Go buy one and come back later!";
    // }
  }

  /**
   * Makes connection to db
   *
   * @param cb
   */
  connect(cb) {
    const IDBRequest = indexedDB.open('Charts', 4);

    IDBRequest.onerror = handleDBError;
    IDBRequest.onsuccess = (e) => {
      this.db = e.target.result;
      cb(this);
    };

    IDBRequest.onupgradeneeded = (e) => {
      this.db = e.target.result;
      // creating tables to store data
      this.createStore(temp, 't', ['v']);
      this.createStore(precip, 't', ['v']);
    }
  }

  /**
   * Create store if needed
   *
   * @param name
   * @param id
   * @param fields
   * @returns {Database}
   */
  createStore(name, id, fields) {
    if (this.db.objectStoreNames.contains(name))
      return this;
    this.store[name] = this.db.createObjectStore(name, {keyPath: id});
    for (let key of fields) {
      this.store[name].createIndex(key, key, {unique: false});
    }
  }

  /**
   * Creates query instance to make transactions
   *
   * @param table
   * @returns {Query}
   */
  find(table) {
    return new Query(this.db, table)
  }

}


class Query {
  constructor(db, table) {
    this.table = table;
    this.db = db;
  }

  /**
   * We need to initialize transaction every time we make a request to a DB
   */
  initTransaction() {
    this.transaction = this.db.transaction([this.table], RW);
    this.transaction.oncomplete = (e) => {
      handleSuccess(e);
    }
    this.transaction.onerror = handleDBError;
    this.model = this.transaction.objectStore(this.table);
  }

  /**
   * Select data by id
   *
   * @param id
   * @param cb
   * @returns {Query}
   */
  select(id, cb) {
    this.initTransaction();
    const request = this.model.get(id);
    request.onsuccess = cb;
    return this;
  }

  /**
   * Select all data from table
   *
   * @param cb
   */
  all(cb) {
    this.initTransaction();
    const request = this.model.getAll();
    request.onsuccess = (e) => {
      cb(e.target.result, this);
    };
  }

  /**
   * Insert row
   *
   * @param data
   * @param cb
   * @returns {Query}
   */
  insert(data, cb) {
    this.initTransaction();
    const request = this.model.add(data);
    request.onsuccess = cb;
    return this;
  }

  /**
   * Remove row
   *
   * @param id
   * @param cb
   * @returns {Query}
   */
  remove(id, cb) {
    this.initTransaction();
    const request = this.model.delete(id);
    request.onsuccess = cb;
    return this;
  }
}