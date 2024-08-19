import {
  Component,
  ElementRef,
  OnChanges, inject, output, viewChild, input } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Clipboard } from '@angular/cdk/clipboard';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';

@Component({
  selector: 'app-code-block',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule, MatButtonModule],
  templateUrl: './code-block.component.html',
  styleUrl: './code-block.component.scss',
})
export class CodeBlockComponent implements OnChanges {
      private readonly clipboard = inject(Clipboard);
  ariaLabel = '';
  private codeText: string = '';

  code = input<string>();
  language = input<string>();
  linenums = input<boolean | number | string>();

  codeFormatted = output<void>();

  codeContainer = viewChild<ElementRef>('codeContainer');

  constructor() {
    hljs.registerLanguage('javascript', javascript);
    hljs.registerLanguage('typescript', typescript);
    hljs.registerLanguage('css', css);
    hljs.registerLanguage('html', html);
  }

  ngOnChanges() {
    if (this.code()) {
      this.formatDisplayedCode();
    }
  }

  private formatDisplayedCode() {
    // const linenums = this.getLinenums();
    const leftAlignedCode = this.leftAlign(this.code()!);

    this.setCodeHtml(leftAlignedCode); // start with unformatted code
    this.codeText = this.getCodeText(); // store the unformatted code as text (for copying)

    const highlightCode = hljs.highlight(this.code()!, {
      language: this.language() || 'javascript',
    }).value;

    this.setCodeHtml(highlightCode);

    if (this.language() && this.language() !== 'none') {
      this.codeFormatted.emit();
    }
  }

  private setCodeHtml(formattedCode: string) {
    this.codeContainer().nativeElement.innerHTML = formattedCode;
  }

  private getCodeText() {
    return this.codeContainer().nativeElement.textContent;
  }

  doCopy() {
    this.codeText = this.getCodeText();
    const successfullyCopied = this.clipboard.copy(this.codeText);

    if (successfullyCopied) {
      // console.log('Copied code to clipboard:', code);
    } else {
      console.error(new Error(`ERROR copying code to clipboard: "${this.codeText}"`));
    }
  }

  getLinenums() {
    let linenums;

    if (typeof this.linenums() === 'boolean') {
      linenums = this.linenums();
    } else if (this.linenums() === 'true') {
      linenums = true;
    } else if (this.linenums() === 'false') {
      linenums = false;
    } else if (typeof this.linenums() === 'string') {
      linenums = Number.parseInt(this.linenums() as string, 10);
    } else {
      linenums = this.linenums();
    }

    return linenums != null && !Number.isNaN(linenums as number) && linenums;
  }

  leftAlign(text: string): string {
    let indent = Number.MAX_VALUE;

    const lines = text.toString().split('\n');

    lines.forEach((line) => {
      const lineIndent = line.search(/\S/);

      if (lineIndent !== -1) {
        indent = Math.min(lineIndent, indent);
      }
    });

    return lines
      .map((line) => line.slice(indent))
      .join('\n')
      .trim();
  }

;
;
;
;
}
