'use strict';

const {flatten, uniq} = require('lodash');
const {selectAllQuery, compareDatabaseRowsByTimestamp, dbColumnIndexes} = require('../../common-utils');
const {DB_SUITES_TABLE_NAME, DB_BROWSERS_TABLE_NAME} = require('../../constants/database');

function getSuitesTableRows(db) {
    const databaseRows = getTableRows(db, DB_SUITES_TABLE_NAME);

    return databaseRows.values.sort(compareDatabaseRowsByTimestamp);
}

function getBrowsersTableRows(db) {
    return getTableRows(db, DB_BROWSERS_TABLE_NAME).values;
}

function getTableRows(db, tableName) {
    const [databaseRows] = db.exec(selectAllQuery(tableName));

    if (!databaseRows) {
        console.warn(`Table "${tableName}" is empty`);

        return [];
    }

    return databaseRows;
}

function formatBrowsersDataFromDb(browsers = []) {
    const list = flatten(browsers);
    const uniqList = uniq(list);

    return uniqList.map((name) => ({id: name}));
}

function formatTestAttempt(attempt) {
    const attemptSuitePath = JSON.parse(attempt[dbColumnIndexes.suitePath]);
    return {
        suitePath: attemptSuitePath,
        name: attemptSuitePath[0],
        children: [{
            name: attempt[dbColumnIndexes.suiteName],
            status: attempt[dbColumnIndexes.status],
            suitePath: attemptSuitePath,
            browsers: [
                {
                    name: attempt[dbColumnIndexes.name],
                    result: {
                        // timestamp corresponds to attempt number -- every next test retry will have bigger
                        // timestamp (just like every next test retry has bigger attempt number)
                        attempt: attempt[dbColumnIndexes.timestamp],
                        description: attempt[dbColumnIndexes.description],
                        imagesInfo: JSON.parse(attempt[dbColumnIndexes.imagesInfo]),
                        metaInfo: JSON.parse(attempt[dbColumnIndexes.metaInfo]),
                        multipleTabs: Boolean(attempt[dbColumnIndexes.multipleTabs]),
                        name: attempt[dbColumnIndexes.name],
                        screenshot: Boolean(attempt[dbColumnIndexes.screenshot]),
                        status: attempt[dbColumnIndexes.status],
                        suiteUrl: attempt[dbColumnIndexes.suiteUrl],
                        skipReason: attempt[dbColumnIndexes.skipReason],
                        error: JSON.parse(attempt[dbColumnIndexes.error])
                    },
                    retries: []
                }
            ]
        }],
        status: attempt[dbColumnIndexes.status]
    };
}

function closeDatabase(db) {
    db.close();
}

module.exports = {
    getSuitesTableRows,
    getBrowsersTableRows,
    formatBrowsersDataFromDb,
    formatTestAttempt,
    closeDatabase
};
