export const ROOMS = ['tavern', 'forest', 'arcade'];
export const MAX_MESSAGE = 400;
export function cleanName(input) {
  return String(input ?? '').replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, 20) || 'Wanderer';
}
export function cleanMessage(input) {
  return String(input ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, MAX_MESSAGE);
}
export function cleanRoom(input) { return ROOMS.includes(input) ? input : 'tavern'; }
export function clamp(n, min, max) { return Math.max(min, Math.min(max, Number.isFinite(Number(n)) ? Number(n) : min)); }
export function cleanPosition(value) { return { x: Math.round(clamp(value?.x, 24, 936)), y: Math.round(clamp(value?.y, 110, 590)) }; }
