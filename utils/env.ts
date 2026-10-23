
export const getEnv = (key: string, fallback: string = ""): string => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
       // @ts-ignore
       return process.env[key];
    }
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
       // @ts-ignore
       return import.meta.env[key];
    }
    // @ts-ignore
    if (typeof window !== 'undefined' && window[key]) {
        // @ts-ignore
        return window[key];
    }
  } catch (e) {
    console.warn(`Error accessing env var ${key}`, e);
  }
  return fallback;
};
