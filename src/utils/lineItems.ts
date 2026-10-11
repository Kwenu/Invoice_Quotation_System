import type { LineGroup } from '../types/document';
import { createGroup, createItem } from './documentFactory';
import { createId } from './id';

export function replaceGroup(groups: LineGroup[], group: LineGroup): LineGroup[] {
  return groups.map((g) => g.id === group.id ? group : g);
}

export function removeGroup(groups: LineGroup[], id: string): LineGroup[] {
  const next = groups.filter((g) => g.id !== id);
  return next.length ? next : [createGroup('plain')];
}

export function duplicateGroup(groups: LineGroup[], id: string): LineGroup[] {
  const index = groups.findIndex((g) => g.id === id);
  if (index < 0) return groups;
  const source = groups[index];
  const copy: LineGroup = {
    ...source,
    id: createId('grp'),
    items: source.items.map((i) => ({ ...i, id: createId('item') }))
  };
  return [...groups.slice(0, index + 1), copy, ...groups.slice(index + 1)];
}

export function moveGroup(groups: LineGroup[], id: string, direction: -1 | 1): LineGroup[] {
  const index = groups.findIndex((g) => g.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= groups.length) return groups;
  const next = [...groups];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function addPlainItem(groups: LineGroup[]): LineGroup[] {
  const last = groups[groups.length - 1];
  if (last && last.kind === 'plain') {
    return groups.map((g) => g.id === last.id ? { ...g, items: [...g.items, createItem()] } : g);
  }
  return [...groups, createGroup('plain')];
}

export function addSection(groups: LineGroup[]): LineGroup[] {
  return [...groups, createGroup('section')];
}

/** Drops empty rows before a document is finalised. */
export function cleanGroups(groups: LineGroup[]): LineGroup[] {
  const cleaned = groups.
  map((g) => ({ ...g, items: g.items.filter((i) => i.description.trim() || i.unitPrice > 0) })).
  filter((g) => g.items.length > 0 || g.kind === 'section' && g.title.trim());
  return cleaned.length ? cleaned : [createGroup('plain')];
}