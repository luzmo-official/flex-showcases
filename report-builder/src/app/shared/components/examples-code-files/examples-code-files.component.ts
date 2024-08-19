import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { CodeBlockComponent } from '../code-block/code-block.component';

@Component({
  selector: 'app-examples-code-files',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatTabsModule,
    CodeBlockComponent,
  ],
  templateUrl: './examples-code-files.component.html',
  styleUrl: './examples-code-files.component.scss',
})
export class ExamplesCodeFilesComponent {
  files = input<{
        name: string;
        content: string;
    }[]>([]);
;
}
