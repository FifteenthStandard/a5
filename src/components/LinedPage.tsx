import { useState } from 'react';
import type { Page } from '../Types';
import './LinedPage.css';

type BlankPageProps = {
  blank: true;
  obverse?: boolean;
};
type EditorPageProps = {
  blank?: false;
  page: Page;
  updatePage: (content: string) => void;
};

type LinedPageProps = BlankPageProps | EditorPageProps;

export default function LinedPage(props: LinedPageProps): React.ReactElement {
  return props.blank
    ? <BlankPage {...props} />
    : <EditorPage {...props} />;
}

function BlankPage({ obverse }: BlankPageProps): React.ReactElement {
  return (
    <article className={`paper a5 lined ${obverse ? ' obverse' : ''}`}>
      <section />
    </article>
  );
};

function EditorPage({ page, updatePage }: EditorPageProps): React.ReactElement {
  const [ text, setText ] = useState('');

  function save(): void {
    const existingContent = page.content.trimEnd();
    const addedContent = text.trimEnd();

    if (addedContent === '') return;

    const newContent = existingContent ? `${existingContent}\n${addedContent}` : addedContent;

    updatePage(newContent);
    setText('');
  }

  function handleBlur(): void {
    save();
    setText('');
  }

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>): void {
    setText(event.target.value);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key !== 'Enter') return;
    if (text.trim() === '') return;

    event.preventDefault();
    save();
  };

  function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>): void {
    event.preventDefault();
  };

  return (
    <article className="paper a5 lined">
      <section>
        <pre className="existing-content">{page.content}</pre>
        <textarea
          key='editor'
          autoFocus
          value={text}
          onBlur={handleBlur}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
      </section>
    </article>
  );
};
