import process from "node:process";

const enabled = !process.env.NO_COLOR && process.stdout.isTTY !== false;

function esc(code: string): string {
  return enabled ? `\x1b[${code}m` : "";
}

export const c = {
  reset: esc("0"),
  bold: esc("1"),
  dim: esc("2"),
  italic: esc("3"),
  underline: esc("4"),
  red: esc("31"),
  green: esc("32"),
  yellow: esc("33"),
  blue: esc("34"),
  magenta: esc("35"),
  cyan: esc("36"),
  white: esc("37"),
  gray: esc("90"),
  brightRed: esc("91"),
  brightGreen: esc("92"),
  brightYellow: esc("93"),
  brightBlue: esc("94"),
  brightMagenta: esc("95"),
  brightCyan: esc("96"),
};

/** Strip all ANSI escape codes from a string. */
export function strip(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}

/** Disable all color output (mutates the `c` object in-place). */
export function disableColors(): void {
  for (const key of Object.keys(c) as (keyof typeof c)[]) {
    (c as Record<string, string>)[key] = "";
  }
}
