import { writable } from 'svelte/store';

export const selectedHistoryNode = writable<number | null>(null);
export const showHistoryPanel = writable<boolean>(false);