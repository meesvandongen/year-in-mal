export function getRandomInteger(range: number): number {
  const max_range = 256;

  // Create byte array and fill with 1 random number
  const byteArray = new Uint8Array(1);
  crypto.getRandomValues(byteArray); // This is the new, and safer API than Math.Random()

  // If the generated number is out of range, try again
  if (byteArray[0] >= Math.floor(max_range / range) * range)
    return getRandomInteger(range);
  return byteArray[0] % range;
}

export function generateRandomString(): string {
  const length = 128;
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(getRandomInteger(possible.length - 1));
  }
  return text;
}

export function generateCodeVerifier(code_challenge: string): string {
  return code_challenge;
}
