import { Injectable } from '@angular/core';
import { PfeBook } from '../models/models';

/**
 * Browser-side persistence for PFE books using IndexedDB.
 *
 * PFE books carry their PDF inline as a base64 data URL, which can be several
 * megabytes — too large for localStorage (~5MB cap). IndexedDB stores them
 * reliably so uploads survive reloads and can be downloaded later.
 */
@Injectable({ providedIn: 'root' })
export class PfeStorageService {
  private readonly DB_NAME = 'esprit_connect';
  private readonly STORE = 'pfe_books';
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.open();
  }

  private open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(this.STORE)) {
          db.createObjectStore(this.STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  /** All saved books, sorted newest first (by upload date, then id). */
  async getAll(): Promise<PfeBook[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const req = db.transaction(this.STORE, 'readonly').objectStore(this.STORE).getAll();
      req.onsuccess = () => {
        const books = (req.result as PfeBook[]).sort((a, b) =>
          (b.uploadedAt || '').localeCompare(a.uploadedAt || '') || b.id - a.id);
        resolve(books);
      };
      req.onerror = () => reject(req.error);
    });
  }

  /** Insert or update a single book. */
  async put(book: PfeBook): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE, 'readwrite');
      tx.objectStore(this.STORE).put(book);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  /** Insert or update many books in one transaction (used to seed the store). */
  async putAll(books: PfeBook[]): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE, 'readwrite');
      const store = tx.objectStore(this.STORE);
      books.forEach(b => store.put(b));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  /** Permanently remove a book. */
  async remove(id: number): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE, 'readwrite');
      tx.objectStore(this.STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  /** Number of books currently stored. */
  async count(): Promise<number> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const req = db.transaction(this.STORE, 'readonly').objectStore(this.STORE).count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
}
