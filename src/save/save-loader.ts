import { localStorageSaveKey } from '../config';

const encode = (data: Object) => btoa(JSON.stringify(data));
const decode = (data: string): Object => JSON.parse(atob(data));

export const save = (data: Object) => localStorage.setItem(localStorageSaveKey, encode(data));
export const load = () => {
  const savedData = localStorage.getItem(localStorageSaveKey);
  if (savedData) {
    try {
      return decode(savedData);
    } catch (err) {
      // if decode throws it means the saved data is not valid json
      return null;
    }
  }
  return null;
};
