export interface LocalStorage {
  cities?: string[];
}

export type LocalStorageKey = keyof LocalStorage;

export function setStoredCities(cities: string[]): Promise<void> {
  const vals : LocalStorage = {
    cities
  }
  return new Promise((resolve) => {
    chrome.storage.local.set(vals,() => {
        resolve();
    });
  });
}

export function getStoredCities(): Promise<string[]> {
    const keys: LocalStorageKey[] = ["cities"];

    return new Promise((resolve) => {
        chrome.storage.local.get(keys, (res: LocalStorage) => resolve(res.cities ?? []))
    })
}

export function setBuddyToken(token : string, type: "token" | "rToken"): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({
      [type]:token
    },() => {
        resolve();
    });
  });
}

export function getBuddyToken(type): Promise<string> {
    const keys: any = [type];
    return new Promise((resolve) => {
        chrome.storage.local.get(keys, (res: any) => {
          return resolve(res[type] ?? null)
        })
    })
}

export function getRefreshCookie(
  url: string = "http://localhost:8002/"
): Promise<string> {
  return new Promise((resolve) => {
    chrome.cookies.get({ url, name: "refresh-buddy" }, function (cookie) {
      resolve(cookie.value ?? null);
    });
  });
}
