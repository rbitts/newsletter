const Promise = require('promise');
var sqlite3 = require('sqlite3').verbose();
var logger = require('./logger');

class DAO {
    constructor(dbFilePath) {
        this.db = new sqlite3.Database(dbFilePath, (err) => {
            if (err) {
                logger.error('Could not connect to database', err)
            } else {
                logger.info('Connected to database')
            }
        })
    }


    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    logger.error('Error running sql ' + sql)
                    logger.error(err)
                    reject(err)
                } else {
                    resolve({ id: this.lastID })
                }
            })
        })
    }


    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, result) => {
                if (err) {
                    logger.error('Error running sql: ' + sql)
                    logger.error(err)
                    reject(err)
                } else {
                    resolve(result)
                }
            })
        })
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    logger.error('Error running sql: ' + sql)
                    logger.error(err)
                    reject(err)
                } else {
                    resolve(rows)
                }
            })
        })
    }
}

class RssFeedModel {
    constructor(dbFilePath){
        this.dao = new DAO(dbFilePath);
        this.createTable();
    }

    createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS feeds (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT, data TEXT)`
        return this.dao.run(sql);
    }
    
    add(url, data){
        return this.dao.run(`INSERT INTO feeds (url, data) VALUES (?, ?)`, [url, data]);
    }

    getByUrl(url){
        return this.dao.get(`SELECT * FROM feeds WHERE url = ?`, [url]);
    }
}

module.exports = RssFeedModel;
