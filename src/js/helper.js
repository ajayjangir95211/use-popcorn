export function timeout(s) {
  return new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error(`Request timed out after ${s} seconds`)),
      s * 1000
    );
  });
}
