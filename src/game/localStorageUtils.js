const FAILURE_KEY = 'pirate_flow_failed_before';

export function getHasFailedBefore() {
  try {
    return localStorage.getItem(FAILURE_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

export function setHasFailedBefore() {
  try {
    localStorage.setItem(FAILURE_KEY, 'true');
  } catch (e) {
    // Ignore storage errors in isolated envs
  }
}
