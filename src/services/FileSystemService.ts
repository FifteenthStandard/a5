import type { NotesEvent } from '../Events';
import SubscriberSet from '../SubscriberSet';
import type { Notes, Page, PageType } from '../Types';
import { IndexedDbService } from './IndexedDbService';

type State = {
  handle: FileSystemDirectoryHandle | null;
  notes: Notes;
};

let state: State = {
  handle: null,
  notes: {
    pages: {},
    index: [],
  },
};

(async function initialize() {
  const savedState = await IndexedDbService.getState<State>('FileSystemClient');
  if (savedState) state.handle = savedState.handle;
}());

window.addEventListener('binderopen', async function () {
  if (state.handle) return;

  const options = {
    id: 'FileSystemClient',
    mode: 'readwrite' as FileSystemPermissionMode,
  };
  state.handle = await window.showDirectoryPicker(options);
  await IndexedDbService.setState('FileSystemClient', state);
});

const subscribers = new SubscriberSet<NotesEvent>();

subscribers.subscribe(async function () {
  await IndexedDbService.setState('FileSystemClient', state);
});

(async function poll() {
  if (state.handle) {
    try {
      const files = state.handle.entries();

      for await (const [name, handle] of files) {
        if (handle.kind !== 'file') continue;

        const file = await handle.getFile();
        const content = await file.text();
        const match = name.match(/^(.+)\.(.+)\.txt$/);

        if (name === 'index.txt') {
          const index = content.split('\n').filter(line => line.trim() !== '');
          if (index.join('\n') === state.notes.index.join('\n')) continue;

          state = {
            ...state,
            notes: {
              ...state.notes,
              index,
            },
          };
          subscribers.notify({
            id: crypto.randomUUID(),
            type: 'indexUpdated',
            index,
          });
        } else if (match) {
          const id = match[1];
          const type = match[2] as PageType;

          if (content === state.notes.pages[id]?.content) continue;

          const page: Page = {
            id,
            type,
            modified: new Date(file.lastModified),
            content,
          };
          state = {
            ...state,
            notes: {
              ...state.notes,
              pages: {
                ...state.notes.pages,
                [id]: page,
              },
            },
          };
          subscribers.notify({
            id: crypto.randomUUID(),
            type: 'pageUpdated',
            page,
          });
        }
      }
    } catch (error) {
      console.error('Error reading directory:', error);
    }
  }
  setTimeout(poll, 5000);
}());

async function handleNotesEvent(event: NotesEvent): Promise<void> {
  switch (event.type) {
    case 'pageUpdated': {

      const fileHandle = await state.handle!.getFileHandle(`${event.page.id}.${event.page.type}.txt`, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(event.page.content);
      await writable.close();
      break;
    }

    case 'indexUpdated': {
      const fileHandle = await state.handle!.getFileHandle('index.txt', { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(event.index.join('\n'));
      await writable.close();
      break;
    }
  }
};

function subscribe(callback: (event: NotesEvent) => void): () => void {
  return subscribers.subscribe(callback);
};

function getSnapshot(): Notes {
  return state.notes;
};

export const FileSystemService = {
  getSnapshot,
  subscribe,
  handleNotesEvent,
};
