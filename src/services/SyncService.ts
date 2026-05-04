import { BinderService } from './BinderService';
import { FileSystemService } from './FileSystemService';
import { IndexedDbService } from './IndexedDbService';
import type { NotesEvent } from '../Events';
import SubscriberSet from '../SubscriberSet';
import type { Index, PageType } from '../Types';

type SyncStatus =
  | 'synced'
  | 'sync-to-local'
  | 'sync-to-remote'
  | 'conflict';

type UnifiedPage = {
  id: string;
  type: PageType;
  syncStatus: SyncStatus;
  localModified: Date | null;
  localContent: string | null;
  remoteModified: Date | null;
  remoteContent: string | null;
};

type UnifiedPages = Record<string, UnifiedPage>;

type UnifiedIndex = {
  syncStatus: SyncStatus;
  localIndex: Index;
  remoteIndex: Index;
};

type UnifiedNotes = {
  index: UnifiedIndex;
  pages: UnifiedPages;
};

let state: UnifiedNotes = {
  index: {
    syncStatus: 'synced',
    localIndex: [],
    remoteIndex: [],
  },
  pages: {},
};

async function setState(newState: Partial<UnifiedNotes>): Promise<void> {
  state = {
    ...state,
    ...newState,
  };
  await IndexedDbService.setState('SyncService', state);
};

const syncToLocalSubscribers: SubscriberSet<NotesEvent> = new SubscriberSet();
const syncToRemoteSubscribers: SubscriberSet<NotesEvent> = new SubscriberSet();

(async function initialize() {
  const savedState = await IndexedDbService.getState<UnifiedNotes>('SyncService');
  if (savedState) state = savedState;
}());

function handleLocalNoteEvent(event: NotesEvent): void {
  switch (event.type) {
    case 'pageUpdated': {
      const existingPage = state.pages[event.page.id] || {
        id: event.page.id,
        type: event.page.type,
        syncStatus: 'synced',
        localModified: null,
        localContent: null,
        remoteModified: null,
        remoteContent: null,
      };

      const syncStatus = event.page.content === existingPage.remoteContent
        ? 'synced'
        : [ 'conflict', 'sync-to-local' ].includes(existingPage.syncStatus)
        ? 'conflict' : 'sync-to-remote';

      const unifiedPage: UnifiedPage = {
        ...existingPage,
        syncStatus,
        localContent: event.page.content,
        localModified: event.page.modified,
      };

      setState({
        pages: {
          ...state.pages,
          [unifiedPage.id]: unifiedPage,
        },
      });

      if (syncStatus === 'sync-to-remote') syncToRemoteSubscribers.notify(event);

      break;
    }

    case 'indexUpdated': {
      const syncStatus = event.index.join(',') === state.index.remoteIndex.join(',')
        ? 'synced'
        : [ 'conflict', 'sync-to-local' ].includes(state.index.syncStatus)
        ? 'conflict' : 'sync-to-remote';

      state = {
        ...state,
        index: {
          ...state.index,
          syncStatus,
          localIndex: event.index,
        },
      };
      setState({
        index: {
          ...state.index,
          syncStatus,
          localIndex: event.index,
        },
      });

      if (syncStatus === 'sync-to-remote') syncToRemoteSubscribers.notify(event);

      break;
    }
  }
};

function handleRemoteNoteEvent(event: NotesEvent): void {
  switch (event.type) {
    case 'pageUpdated': {
      const existingPage = state.pages[event.page.id] || {
        id: event.page.id,
        type: event.page.type,
        syncStatus: 'synced',
        localModified: null,
        localContent: null,
        remoteModified: null,
        remoteContent: null,
      };

      const syncStatus = event.page.content === existingPage.localContent
        ? 'synced'
        : [ 'conflict', 'sync-to-remote' ].includes(existingPage.syncStatus)
        ? 'conflict' : 'sync-to-local';

      const unifiedPage: UnifiedPage = {
        ...existingPage,
        syncStatus,
        remoteContent: event.page.content,
        remoteModified: event.page.modified,
      };

      setState({
        pages: {
          ...state.pages,
          [unifiedPage.id]: unifiedPage,
        },
      });

      if (syncStatus === 'sync-to-local') syncToLocalSubscribers.notify(event);

      break;
    }

    case 'indexUpdated': {
      const syncStatus = event.index.join(',') === state.index.localIndex.join(',')
        ? 'synced'
        : [ 'conflict', 'sync-to-remote' ].includes(state.index.syncStatus)
        ? 'conflict' : 'sync-to-local';

      setState({
        index: {
          ...state.index,
          syncStatus,
          remoteIndex: event.index,
        },
      });

      if (syncStatus === 'sync-to-local') syncToLocalSubscribers.notify(event);

      break;
    }
  }
};

BinderService.subscribe(handleLocalNoteEvent);
FileSystemService.subscribe(handleRemoteNoteEvent);

syncToLocalSubscribers.subscribe(BinderService.handleNotesEvent);
syncToRemoteSubscribers.subscribe(FileSystemService.handleNotesEvent);
