import type { Page } from '../types';
import './LinedPage.css';

export default function LinedPage({ page, savePage }: { page: Page, savePage: (content: string) => void }): React.ReactElement {
  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>): void {
    savePage(event.target.value);
  };

  return (
    <div className="binder-page">
      <article className="page-side front">
        <textarea
          id={page.id}
          className="pen"
          value={page.content}
          onChange={handleChange}
          autoCorrect="off"
          spellCheck="false"
        />
      </article>
      <div className="page-side back">
        <textarea disabled />
      </div>
    </div>
  );
};