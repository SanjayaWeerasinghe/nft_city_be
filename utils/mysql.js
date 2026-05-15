
function insert(query, data = {}, connection) {
    return new Promise((resolve, reject) => {
        connection.query(query, data, function(err, results) {
            if(err) return reject(err);

            resolve(results);
        })
    })
}

function select(query, values, connection) {
    return new Promise((resolve, reject) => {
        connection.query(query, values, function(err, results) {
            if(err) return reject(err);

            resolve(results);
        })
    })
}

function update(query, values, connection) {
    return new Promise((resolve, reject) => {
        connection.query(query, values, function(err, results) {
            if(err) return reject(err);

            resolve(results);
        })
    })
}

function remove(query, connection) {
    return new Promise((resolve, reject) => {
        connection.query(query, function(err, results) {
            if(err) return reject(err);

            resolve(results);
        })
    })
}

module.exports = { insert, select, update, remove };