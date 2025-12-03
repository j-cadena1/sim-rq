/**
 * Converts object keys from snake_case to camelCase recursively
 * @param obj - Object with snake_case keys
 * @returns Object with camelCase keys
 */
export const toCamelCase = <T>(obj: any): T => {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v)) as any;
  }
  if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      (result as any)[camelKey] = toCamelCase((obj as any)[key]);
      return result;
    }, {} as T);
  }
  return obj as T;
};
