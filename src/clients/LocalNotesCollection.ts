import { StateStore } from './IndexedDbClient';
import type { NotesEvent } from '../Events';
import SubscriberSet from '../SubscriberSet';
import type { Notes, Page, PageType } from '../Types';

let state: Notes = {
  index: [],
  pages: {},
};

const subscribers: SubscriberSet<NotesEvent> = new SubscriberSet();

(async function initialize() {
  const savedState = await StateStore.getState<Notes>('LocalNotesCollection');
  if (savedState) state = savedState;
    subscribers.notify({
      id: crypto.randomUUID(),
      type: 'stateInitialized',
      notes: state,
    });
}());

subscribers.subscribe(async function () {
  await StateStore.setState('LocalNotesCollection', state);
});

function getSnapshot(): Notes {
  return state;
}

function subscribe(callback: (event: NotesEvent) => void): () => void {
  return subscribers.subscribe(callback);
};

function handleNotesEvent(event: NotesEvent): void {
  switch (event.type) {
    case 'pageUpdated':
      state = {
        ...state,
        pages: {
          ...state.pages,
          [event.page.id]: event.page,
        },
      }
      subscribers.notify(event);
      break;

    case 'indexUpdated':
      state = {
        ...state,
        index: event.index,
      };
      subscribers.notify(event);
      break;
  }
};

function addNewPageBefore(pageId: string | null, type: PageType): string {
  const id = new Date().toISOString().replaceAll(/[-T:.Z]/g,'');
  const page: Page = {
    id,
    type,
    modified: new Date(),
    content: '',
  };
  const pageIndex = pageId ? state.index.findIndex(id => id === pageId) : state.index.length;
  const index = [
    ...state.index.slice(0, pageIndex),
    id,
    ...state.index.slice(pageIndex),
  ];
  state = {
    ...state,
    pages: {
      ...state.pages,
      [id]: page,
    },
    index,
  };
  subscribers.notify({
    id: crypto.randomUUID(),
    type: 'pageUpdated',
    page,
  });
  subscribers.notify({
    id: crypto.randomUUID(),
    type: 'indexUpdated',
    index,
  });
  return id;
};

function updatePage(pageId: string, content: string): void {
  const existingPage = state.pages[pageId];
  if (!existingPage) return;
  const page = {
    ...existingPage,
    content,
    modified: new Date(),
  };
  state = {
    ...state,
    pages: {
      ...state.pages,
      [pageId]: page,
    },
  };
  subscribers.notify({
    id: crypto.randomUUID(),
    type: 'pageUpdated',
    page,
  });
};

export const LocalNotesCollection = {
  getSnapshot,
  subscribe,
  handleNotesEvent,
  addNewPageBefore,
  updatePage,
};
