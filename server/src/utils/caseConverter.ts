/**
 * Converts a snake_case string to camelCase
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts all keys in an object from snake_case to camelCase
 */
export function toCamelCase<T>(obj: Record<string, any>): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item)) as T;
  }

  const converted: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const camelKey = snakeToCamel(key);
    converted[camelKey] = obj[key];
  }
  return converted as T;
}

/**
 * Converts an array of database rows to camelCase
 */
export function rowsToCamelCase<T>(rows: Record<string, any>[]): T[] {
  return rows.map(row => toCamelCase<T>(row));
}
