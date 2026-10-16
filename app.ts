import './styles.css';
import { bestShot } from './bestShot';
import { bonuses, createExample } from './fixtures';
import { createRandomField, parseField, serializeField } from './fieldEditor';
import { ElementType, Point } from './types';

let example: number | null = 0;
let selected = 3;
let field = createExample(0);

// Keep uncommitted edits separate from the field used by the solver.
let draft = serializeField(field);
let editorError = '';

const app = document.querySelector<HTMLDivElement>('#app')!;

const key = ({ x, y }: Point) => `${x},${y}`;
const coordinates = ({ x, y }: Point) => `(${x}, ${y})`;
const buttonClasses = 'cursor-pointer rounded border px-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2';

function render(): void {
  const shot = bestShot(field, bonuses[selected].bonus)!;

  // Coordinate keys keep target and affected-cell highlighting separate.
  const affected = new Set(shot.affected.map(key));
  const targets = new Set(shot.targets.map(key));

  const cells = field.map((row, y) => `
    <span class="flex items-center justify-center text-xs text-gray-500">${y}</span>
    ${row.map((item, x) => {
      const position = { x, y };
      const hit = affected.has(key(position));
      const target = targets.has(key(position));
      const blocker = item?.type === ElementType.Blocker && item.isBlocker;
      const label = `Column ${x}, row ${y}: priority ${item?.weight ?? 'empty'}${blocker ? ', blocker' : ''}${hit ? ', affected' : ''}${target ? ', target' : ''}`;

      return `
        <div
          class="relative flex aspect-square items-center justify-center border text-xs sm:text-base ${hit ? 'border-red-400 bg-red-200' : 'border-gray-300 bg-white'} ${target ? 'z-10 bg-red-400' : ''}"
          aria-label="${label}"
          title="${label}"
        >
          ${item?.weight ?? ''}${blocker ? '<span class="absolute right-0.5 top-0 text-[9px]" aria-hidden="true">B</span>' : ''}
        </div>`;
    }).join('')}
  `).join('');

  app.innerHTML = `
    <main class="mx-auto max-w-5xl p-4 font-sans text-gray-900 sm:p-6">
      <h1 class="mb-4 text-xl font-semibold">🎯 Best bonus target shot</h1>

      <div class="mb-5 flex flex-wrap gap-2" role="group" aria-label="Field controls">
        ${[0, 1].map(index => `
          <button
            type="button"
            data-example="${index}"
            aria-pressed="${example === index}"
            class="${buttonClasses} ${example === index ? 'border-black bg-gray-100' : 'border-gray-300'}"
          >Example ${index + 1}</button>
        `).join('')}
        <button type="button" id="shuffle" class="${buttonClasses} border-gray-300">Shuffle</button>
      </div>

      <div class="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_240px]">
        <section class="min-w-0" aria-label="11 by 11 game field">
          <div class="grid grid-cols-[16px_repeat(11,minmax(0,1fr))] gap-0.5">
            <span></span>
            ${Array.from({ length: 11 }, (_, x) => `
              <span class="text-center text-xs text-gray-500">${x}</span>
            `).join('')}
            ${cells}
          </div>
          <p class="mt-3 text-sm">Numbers: priorities. B: blocker. Light red: affected. Dark red: target.</p>
        </section>

        <aside class="min-w-0">
          <h2 class="mb-2 font-semibold">Bonus</h2>
          <div class="flex flex-col gap-2" role="group" aria-label="Bonus type">
            ${bonuses.map((entry, index) => `
              <button
                type="button"
                data-bonus="${index}"
                aria-pressed="${selected === index}"
                class="${buttonClasses} ${selected === index ? 'border-black bg-gray-100' : 'border-gray-300'}"
              >${entry.label}</button>
            `).join('')}
          </div>

          <div class="mt-5 space-y-2 text-sm" aria-live="polite" aria-atomic="true">
            <p><strong>Targets (x, y):</strong> ${shot.targets.map(coordinates).join(', ')}</p>
            <p><strong>Pieces hit:</strong> ${shot.affected.length}</p>
            <p class="break-words"><strong>Priorities:</strong> ${shot.priorities.join(', ')}</p>
          </div>
          <p class="mt-4 text-sm text-gray-600">Coordinates start at 0. Priorities are compared highest first. Rockets stop at blockers; bombs cover 5 × 5 cells.</p>
        </aside>
      </div>
      <section class="mt-6" aria-labelledby="editor-label">
        <label id="editor-label" for="field-editor" class="mb-2 block font-semibold">Edit field</label>
        <p id="editor-help" class="mb-2 text-sm text-gray-600">11 rows of 11 space-separated cells. Use 1–5 for pieces, B1–B5 for blockers, 0 for bonuses, and . for empty cells.</p>
        <textarea
          id="field-editor"
          rows="11"
          spellcheck="false"
          wrap="off"
          aria-describedby="editor-help editor-error"
          class="block w-full max-w-xl rounded border border-gray-300 p-2 font-mono text-sm focus-visible:outline-2"
        ></textarea>
        <p id="editor-error" role="alert" class="mt-2 text-sm text-red-700"></p>
        <button type="button" id="apply-field" class="${buttonClasses} mt-3 border-gray-300">Apply field</button>
      </section>
    </main>`;

  // Assign user input as text, never as HTML in the render template.
  const editor = app.querySelector<HTMLTextAreaElement>('#field-editor')!;
  editor.value = draft;
  editor.setAttribute('aria-invalid', String(Boolean(editorError)));
  app.querySelector<HTMLParagraphElement>('#editor-error')!.textContent = editorError;

  editor.addEventListener('input', () => {
    draft = editor.value;
  });

  app.querySelector<HTMLButtonElement>('#apply-field')!.addEventListener('click', () => {
    try {
      const nextField = parseField(draft);
      field = nextField;
      draft = serializeField(field);
      example = null;
      editorError = '';
    } catch (error) {
      // Invalid drafts must not replace the last usable board.
      editorError = error instanceof Error ? error.message : 'Invalid field.';
    }

    render();
    app.querySelector<HTMLButtonElement>('#apply-field')?.focus();
  });

  app.querySelector<HTMLButtonElement>('#shuffle')!.addEventListener('click', () => {
    field = createRandomField();
    draft = serializeField(field);
    example = null;
    editorError = '';

    render();
    app.querySelector<HTMLButtonElement>('#shuffle')?.focus();
  });

  // Rendering replaces the buttons, so reconnect handlers and restore focus.
  app.querySelectorAll<HTMLButtonElement>('[data-bonus]').forEach(button => {
    button.addEventListener('click', () => {
      selected = Number(button.dataset.bonus);
      render();

      app.querySelector<HTMLButtonElement>(`[data-bonus="${selected}"]`)?.focus();
    });
  });

  app.querySelectorAll<HTMLButtonElement>('[data-example]').forEach(button => {
    button.addEventListener('click', () => {
      example = Number(button.dataset.example);
      field = createExample(example);
      draft = serializeField(field);
      editorError = '';

      render();

      app.querySelector<HTMLButtonElement>(`[data-example="${example}"]`)?.focus();
    });
  });
}

render();
