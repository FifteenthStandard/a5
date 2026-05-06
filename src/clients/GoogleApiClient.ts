import type { NotesEvent } from "../Events";
import type { NotesClient } from "../Interfaces";
import StateService from "../services/StateService";
import type { Index, Notes, Page, PageType } from "../Types";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string;
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

const TOKEN_KEY = 'gd_token';
const TOKEN_EXPIRY_KEY = 'gd_token_expiry';

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

function waitFor<T>(getter: () => T | undefined): Promise<T> {
  return new Promise(resolve => {
    const check = () => {
      const value = getter();
      if (value) { resolve(value); return; }
      setTimeout(check, 50);
    };
    check();
  });
}

async function getToken(): Promise<string> {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
  if (token && expiry && Date.now() < Number(expiry)) return token;
  return authorize();
}

function authorize(): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const google = await waitFor(() => window.google);
    const client = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.error) { reject(new Error(response.error)); return; }
        const expiresAt = Date.now() + (Number(response.expires_in) - 60) * 1000;
        sessionStorage.setItem(TOKEN_KEY, response.access_token);
        sessionStorage.setItem(TOKEN_EXPIRY_KEY, String(expiresAt));
        resolve(response.access_token);
      },
    });
    client.requestAccessToken();
  });
};

function pickFolder(): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const [token, gapi] = await Promise.all([
      getToken(),
      waitFor(() => window.gapi),
    ]);
    gapi.load('picker', () => {
      const view = new window.google.picker.DocsView(window.google.picker.ViewId.FOLDERS)
        .setSelectFolderEnabled(true);
      const picker = new window.google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(token)
        .setDeveloperKey(API_KEY)
        .setCallback((data: any) => {
          if (data.action === window.google.picker.Action.PICKED) {
            const folderId = data.docs[0].id;
            resolve(folderId);
          } else if (data.action === window.google.picker.Action.CANCEL) {
            reject(new Error('Folder selection cancelled'));
          }
        })
        .build();
      picker.setVisible(true);
    });
  });
};

type State = {
  folder: string | null;
  filenameToFileId: Record<string, string>;
  lastModified: string;
};

let state: State = {
  folder: null,
  filenameToFileId: {},
  lastModified: '1970-01-01T00:00:00.000Z',
};

async function setState(newState: Partial<State>): Promise<void> {
  state = {
    ...state,
    ...newState,
  };
  await StateService.setState('GoogleApiClient', state);
};

const initialized = (async function initialize() {
  const savedState = await StateService.getState<State>('GoogleApiClient');
  if (savedState) state = savedState;
}());

window.addEventListener('binderopen', async function () {
  if (state.folder) return;

  const folder = await pickFolder();

  await setState({ folder });
});

async function createFile(filename: string, content: string): Promise<void> {
  const token = await getToken();

  const metadata = { name: filename, parents: [state.folder!] };
  const body = new FormData();
  body.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  body.append('file', new Blob([content], { type: 'text/plain' }));

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body,
    }
  );

  if (!res.ok) throw new Error(`Drive API error: ${res.status}`);

  const data = await res.json();
  const fileId = data.id;

  await setState({
    filenameToFileId: {
      ...state.filenameToFileId,
      [filename]: fileId,
    },
  });
};

async function updateFile(fileId: string, content: string): Promise<void> {
  const token = await getToken();

  const body = new Blob([content], { type: 'text/plain' });

  const res = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
    {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
      body,
    }
  );

  if (!res.ok) throw new Error(`Drive API error: ${res.status}`);
};

async function getFileContent(fileId: string): Promise<string> {
  const token = await getToken();

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );

  if (!res.ok) throw new Error(`Drive API error: ${res.status}`);

  const content = await res.text();

  return content;
};

type FileMetadata = {
  id: string;
  name: string;
  modifiedTime: string;
};

async function getModifiedFiles(): Promise<FileMetadata[]> {
  await initialized;

  if (!state.folder) return [];

  const token = await getToken();

  const query = `'${state.folder}' in parents and modifiedTime > '${state.lastModified}' and mimeType = 'text/plain'`;
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime asc`,
    {
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );

  if (!res.ok) throw new Error(`Drive API error: ${res.status}`);

  const data = await res.json();
  const files: FileMetadata[] = data.files;

  return files;
};

async function getAllFiles(): Promise<FileMetadata[]> {
  await initialized;

  if (!state.folder) return [];

  const token = await getToken();

  const query = `'${state.folder}' in parents and mimeType = 'text/plain'`;
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime)`,
    {
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );

  if (!res.ok) throw new Error(`Drive API error: ${res.status}`);

  const data = await res.json();
  const files: FileMetadata[] = data.files;

  return files;
};

type PageOrIndex = { type: 'page' | 'index'; value: Page | Index };

async function getNoteFile(file: FileMetadata): Promise<PageOrIndex | null> {
  const content = await getFileContent(file.id);
  const match = file.name.match(/^(.+)\.(.+)\.txt$/);

  if (file.name === 'index.txt') {
    const index: Index = content.trim().split('\n');
    return { type: 'index', value: index };
  } else if (match) {
    const [ , id, type ] = match;
    const page: Page = {
      id,
      type: type as PageType,
      modified: new Date(file.modifiedTime),
      content,
    };
    return { type: 'page', value: page };
  } else {
    return null;
  }
};

async function savePage(page: Page): Promise<void> {
  const filename = `${page.id}.${page.type}.txt`;
  const fileId = state.filenameToFileId[filename];
  const content = page.content;

  if (fileId) {
    await updateFile(fileId, content);
  } else {
    await createFile(filename, content);
  }
};

async function saveIndex(index: Index): Promise<void> {
  const filename = 'index.txt';
  const fileId = state.filenameToFileId[filename];
  const content = index.join('\n');

  if (fileId) {
    await updateFile(fileId, content);
  } else {
    await createFile(filename, content);
  }
};

async function getSnapshot(): Promise<Notes> {
  const notes: Notes = {
    index: [],
    pages: {},
  };

  const files = await getAllFiles();
  for (const file of files) {
    const note = await getNoteFile(file);
    if (!note) continue;

    switch (note.type) {
      case 'index':
        notes.index = note.value as Index;
        break;

      case 'page':
        const page = note.value as Page;
        notes.pages[page.id] = page;
        break;
    }
  }

  return notes;
};

async function* poll(): AsyncGenerator<NotesEvent> {
  await waitFor(() => state.folder);

  const modifiedFiles = await getModifiedFiles();

  for (const file of modifiedFiles) {
    if (file.modifiedTime > state.lastModified) {
      await setState({
        lastModified: file.modifiedTime,
      });
    }

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

      case 'page':
        yield {
          id: crypto.randomUUID(),
          type: 'pageUpdated',
          page: note.value as Page,
        };
        break;
    }
  }
};

export const GoogleApiClient: NotesClient = {
  savePage,
  saveIndex,
  getSnapshot,
  poll,
};
