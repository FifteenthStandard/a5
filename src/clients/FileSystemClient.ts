import { IndexedDbService } from '../services/IndexedDbService';
import type { NotesEvent } from "../Events";
import type { NotesClient } from "../Interfaces";
import type { Index, Notes, Page, PageType } from "../Types";

type State = {
  handle: FileSystemDirectoryHandle | null;
  lastModifieds: Record<string, number>;
};

let state: State = {
  handle: null,
  lastModifieds: {},
};

async function setState(newState: Partial<State>): Promise<void> {
  state = {
    ...state,
    ...newState,
  };
  await IndexedDbService.setState('FileSystemClient', state);
};

(async function initialize() {
  const savedState = await IndexedDbService.getState<State>('FileSystemClient');
  if (savedState) state = savedState;
}());

window.addEventListener('binderopen', async function () {
  if (state.handle) return;

  const options = {
    id: 'FileSystemClient',
    mode: 'readwrite' as FileSystemPermissionMode,
  };
  const handle = await window.showDirectoryPicker(options);

  await setState({ handle });
});

async function savePage(page: Page): Promise<void> {
  const fileHandle = await state.handle!.getFileHandle(`${page.id}.${page.type}.txt`, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(page.content);
  await writable.close();
};

async function saveIndex(index: Index): Promise<void> {
  const fileHandle = await state.handle!.getFileHandle('index.txt', { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(index.join('\n'));
  await writable.close();
};

type PageOrIndex = { type: 'page' | 'index'; value: Page | Index };

async function getNoteFile(file: File): Promise<PageOrIndex | null> {
  const content = await file.text();
  const match = file.name.match(/^(.+)\.(.+)\.txt$/);

  if (file.name === 'index.txt') {
    const index: Index = content.trim().split('\n');
    return { type: 'index', value: index };
  } else if (match) {
    const [ , id, type ] = match;
    const page: Page = {
      id,
      type: type as PageType,
      modified: new Date(file.lastModified),
      content,
    };
    return { type: 'page', value: page };
  } else {
    return null;
  }
};

async function getSnapshot(): Promise<Notes> {
  const notes: Notes = {
    index: [],
    pages: {},
  };

  const files = state.handle!.entries();
  for await (const [ _, handle ] of files) {
      if (handle.kind !== 'file') continue;

      const file = await handle.getFile();
      const note = await getNoteFile(file);
      if (!note) continue;

      if (note.type === 'index') {
        notes.index = note.value as Index;
      } else {
        const page = note.value as Page;
        notes.pages[page.id] = page;
      }
  }

  return notes;
};

async function* poll(): AsyncGenerator<NotesEvent> {
  if (!state.handle) return;

  const files = state.handle!.entries();
  for await (const [ name, handle ] of files) {
    if (handle.kind !== 'file') continue;

    const file = await handle.getFile();
    const lastModified = file.lastModified;

    if (state.lastModifieds[name] && state.lastModifieds[name] >= lastModified) continue;
    await setState({
      lastModifieds: {
        ...state.lastModifieds,
        [name]: lastModified,
      },
    });

    const note = await getNoteFile(file);
    if (!note) continue;

    switch (note.type) {
      case 'index':
        yield {
          id: crypto.randomUUID(),
          type: 'indexUpdated',
          index: note.value as Index,
        };
        break;

      case 'page': {
        const page = note.value as Page;
        yield {
          id: crypto.randomUUID(),
          type: 'pageUpdated',
          page,
        };
        break;
      }
    }
  }
};

export const FileSystemClient: NotesClient = {
  savePage,
  saveIndex,
  getSnapshot,
  poll,
};
