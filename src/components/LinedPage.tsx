import { useState } from 'react';
import type { Page } from '../Types';
import './LinedPage.css';

type BlankPageProps = {
  blank: true;
  obverse: boolean;
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

  function BlankPage({ obverse }: BlankPageProps): React.ReactElement {
    return (
      <article className={`paper a5 lined ${obverse ? ' obverse' : ''}`}>
        <section />
      </article>
    );
  };

  function EditorPage({ page, updatePage }: EditorPageProps): React.ReactElement {
    const [ content, setContent ] = useState(page.content);
    
    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
      setContent(e.target.value);
    }

    function handleBlur(): void {
      updatePage(content);
    }

    return (
      <article className="paper a5 lined">
        <section>
          <textarea
            value={content}
            onChange={handleChange}
            onBlur={handleBlur}
            />
        </section>
      </article>
    );
  };
};
