/** Imports and exports the single mock-data source used by the application. */
// Load the application records from the project's JSON data file.
import database from '../../db.json';

// Share one data source across every dashboard page and service.
export const db = database;
