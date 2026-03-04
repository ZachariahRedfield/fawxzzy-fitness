export function info(message: string): void {
  console.log(message);
}

export function warn(message: string): void {
  console.warn(`warning: ${message}`);
}

export function error(message: string): void {
  console.error(`error: ${message}`);
}
