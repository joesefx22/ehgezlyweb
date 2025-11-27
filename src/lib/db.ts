// src/lib/db.ts
// thin wrapper around your root-level db.js

// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require('../../db.js');

export const execQuery = db.execQuery;
export const execQueryOne = db.execQueryOne;
export const withTransaction = db.withTransaction;
export const createTables = db.createTables;
export const healthCheck = db.healthCheck;
export const pool = db.pool;
