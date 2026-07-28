/**
 * Provides a tiny persistent data layer for the frontend prototype.
 *
 * The project still uses seed data from db.json, but user changes are stored
 * in localStorage and broadcast to subscribers. Replacing this module with
 * HTTP calls is the single migration point when a backend is introduced.
 */
import { db } from '../data/db';
import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'orchasp-hrms-data';
const listeners = new Set();
let snapshot;

/** Returns the saved dataset, falling back to the immutable seed records. */
function read() {
  if (snapshot) return snapshot;
  try {
    snapshot = JSON.parse(localStorage.getItem(STORAGE_KEY)) || structuredClone(db);
  } catch {
    snapshot = structuredClone(db);
  }
  return snapshot;
}

/** Saves a dataset and tells mounted pages to refresh their local snapshot. */
function write(next) {
  snapshot = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
  return next;
}

/** Creates an ID that is readable in UI and safe for client-side demo data. */
function createId(prefix) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

export const hrmsStore = {
  getSnapshot: read,
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  employees: {
    create(values) {
      const data = read();
      const employee = { id: createId('emp'), status: 'active', skills: [], performanceScore: 0, ...values };
      data.employees.unshift(employee);
      write(data);
      return employee;
    },
    update(id, values) {
      const data = read();
      data.employees = data.employees.map((employee) => employee.id === id ? { ...employee, ...values } : employee);
      write(data);
      return data.employees.find((employee) => employee.id === id);
    },
    remove(id) {
      const data = read();
      data.employees = data.employees.filter((employee) => employee.id !== id);
      write(data);
    },
    import(rows) {
      const data = read();
      const imported = rows.map((row) => ({
        id: createId('emp'), status: row.status || 'active', employmentType: row.employmentType || 'full-time',
        skills: [], performanceScore: 0, ...row,
      }));
      data.employees.unshift(...imported);
      write(data);
      return imported.length;
    },
  },
  assets: {
    create(values) {
      const data = read();
      const asset = { id: createId('asset'), status: 'available', assignedToId: null, assignedDate: null, ...values };
      data.assets.unshift(asset);
      write(data);
      return asset;
    },
    update(id, values) {
      const data = read();
      data.assets = data.assets.map((asset) => asset.id === id ? { ...asset, ...values } : asset);
      write(data);
      return data.assets.find((asset) => asset.id === id);
    },
    remove(id) {
      const data = read();
      data.assets = data.assets.filter((asset) => asset.id !== id);
      write(data);
    },
    assign(assetId, employeeId) {
      return this.update(assetId, { assignedToId: employeeId, assignedDate: new Date().toISOString().slice(0, 10), status: 'assigned' });
    },
    returnAsset(id) {
      return this.update(id, { assignedToId: null, assignedDate: null, status: 'available' });
    },
  },
};

/** Lets React pages rerender whenever the local prototype data changes. */
export function useHrmsData() {
  return useSyncExternalStore(hrmsStore.subscribe, hrmsStore.getSnapshot, hrmsStore.getSnapshot);
}
