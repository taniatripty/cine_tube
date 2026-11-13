export const getRawSessionToken = (sessionToken: string): string =>
  sessionToken.split(".", 1)[0]
