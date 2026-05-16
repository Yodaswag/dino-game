export function loadAssets(assetMap) {
  return Promise.all(
    Object.entries(assetMap).map(([key, src]) => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve([key, image]);
      image.onerror = reject;
      image.src = src;
    }))
  ).then(Object.fromEntries);
}
