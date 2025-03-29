/**
 * Save data to local storage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
export function saveToLocalStorage(key, value) {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Get data from local storage
 * @param {string} key - Storage key
 * @returns {any} - Retrieved value or null if not found
 */
export function getFromLocalStorage(key) {
  try {
    const serializedValue = localStorage.getItem(key);
    return serializedValue ? JSON.parse(serializedValue) : null;
  } catch (error) {
    console.error('Error getting from localStorage:', error);
    return null;
  }
}

/**
 * Remove data from local storage
 * @param {string} key - Storage key
 */
export function removeFromLocalStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}