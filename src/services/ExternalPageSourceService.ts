import StateService from './StateService';
import type { NotesEvent } from '../Events';
import type { NotesClient, NotesSource } from '../Interfaces';
import SubscriberSet from '../SubscriberSet';
import type { Notes } from '../Types';

type State = {
  notes: Notes;
};

export default function createExternalPageSource(serviceName: string, client: NotesClient): NotesSource {
  let state: State = {
    notes: {
      index: [],
      pages: {},
    },
  };

  async function setState(newState: Partial<State>): Promise<void> {
    state = {
      ...state,
      ...newState,
    };
    await StateService.setState(serviceName, state);
  };

  (async function initialize() {
    const savedState = await StateService.getState<State>(serviceName);
    if (savedState) {
      state = savedState;
    } else {
      const notes = await client.getSnapshot();
      setState({ notes });
    }
  }());

  const subscribers = new SubscriberSet<NotesEvent>();

  (async function poll() {
    for await (const event of client.poll()) {
      switch (event.type) {
        case 'pageUpdated':
          const page = event.page;
          setState({
            notes: {
              ...state.notes,
              pages: {
                ...state.notes.pages,
                [page.id]: page,
              },
            },
          });
          break;

        case 'indexUpdated':
          const index = event.index;
          setState({
            notes: {
              ...state.notes,
              index,
            },
          });
          break;
      }

      subscribers.notify(event);
    };
    setTimeout(poll, 5000);
  }());

  function getSnapshot(): Notes {
    return state.notes;
  };

  async function handleNotesEvent(event: NotesEvent): Promise<void> {
    switch (event.type) {
      case 'pageUpdated':
        await client.savePage(event.page);
        break;

      case 'indexUpdated':
        await client.saveIndex(event.index);
        break;
    }

    subscribers.notify(event);
  };

  function subscribe(callback: (event: NotesEvent) => void) {
    return subscribers.subscribe(callback);
  };

  return {
    getSnapshot,
    handleNotesEvent,
    subscribe,
  };
};
