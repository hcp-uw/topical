let authenticated = false;

export function setAuthenticated(value: boolean) {
  authenticated = value;
}

export function isAuthenticated() {
  return authenticated;
}
