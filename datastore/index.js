const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  var id;
  counter.getNextUniqueId((err, counterString) => {
    id = counterString;
    // items[id] = text;
    fs.writeFile(path.join(exports.dataDir, `${id}.txt`), text, (err) => {
      if (err) {
        throw ('error writing todo file');
      } else {
        callback(null, { id, text });
      }
    });
  });
};

exports.readAll = (callback) => {

  new Promise(function (resolve, reject) {
    fs.readdir(exports.dataDir, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  })
    .then(function (files) {
      var promiseArr = [];
      files.forEach(file => {
        promiseArr.push(new Promise(function (resolve, reject) {
          fs.readFile(path.join(exports.dataDir, file), 'utf8', (err, fileData) => {
            if (err) {
              reject(err);
            } else {
              resolve(fileData);
            }
          });
        })
          .then(function (fileData) {
            items[file.split('.')[0]] = fileData;
          })
        );
      });
      Promise.all(promiseArr).then(function() {

        var data = _.map(items, (text, id) => {
          return { id, text };
        });
        callback(null, data);
      });
    });
};



exports.readOne = (id, callback) => {

  fs.readdir(exports.dataDir, (err, files) => {

    var fileName = id + '.txt';

    if (files.includes(fileName)) {
      var text = fs.readFileSync(path.join(exports.dataDir, fileName), 'utf8');
      callback(null, { id, text });
    } else {
      callback(new Error(`No item with id: ${id}`));
    }
  });
};

exports.update = (id, text, callback) => {
  fs.readdir(exports.dataDir, (err, files) => {

    var fileName = id + '.txt';
    if (files.includes(fileName)) {
      fs.writeFile(path.join(exports.dataDir, fileName), text, () => {
        callback(null, { id, text });
      });
    } else {
      callback(new Error(`No item with id: ${id}`));
    }
  });
};

exports.delete = (id, callback) => {
  fs.readdir(exports.dataDir, (err, files) => {

    var fileName = id + '.txt';
    if (files.includes(fileName)) {
      fs.unlink(path.join(exports.dataDir, fileName), () => {
        callback();
      });
    } else {
      callback(new Error(`No item with id: ${id}`));
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
