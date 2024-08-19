import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  model,
  OnInit,
  signal
} from '@angular/core';
import { CdkDragDrop, CdkDropList } from "@angular/cdk/drag-drop";
import { ChartService } from "../../shared/services/chart.service";
import { COLUMN_TYPE_ICONS } from "../../shared/constants/charts.constant";
import { MatIcon } from "@angular/material/icon";
import { MatButton, MatButtonModule, MatIconButton } from "@angular/material/button";
import { MatFormField, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import { MatRadioButton, MatRadioGroup } from "@angular/material/radio";
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  MatChipEditedEvent,
  MatChipGrid,
  MatChipInput,
  MatChipInputEvent,
  MatChipRemove,
  MatChipRow
} from "@angular/material/chips";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { skip } from "rxjs";
import { MatOption, MatSelect } from "@angular/material/select";
import { MatTooltip } from "@angular/material/tooltip";

type ArgumentArity = 'no-args' | 'one-arg' | 'multiple-args';

type FilterOption = {
  label: string;
  value: string;
  argumentArity: ArgumentArity;
  forColumnType?: string;
}

export type Value = string | number;

const FILTER_OPTIONS = [
  {
    label: 'is equal to any of',
    value: '? in ?',
    argumentArity: 'multiple-args'
  },
  {
    label: 'is not equal to any of',
    value: '? not in ?',
    argumentArity: 'multiple-args'
  },
  {
    label: 'is equal to',
    value: '? = ?',
    argumentArity: 'one-arg'
  },
  {
    label: 'is not equal to',
    value: '? != ?',
    argumentArity: 'one-arg'
  },
  {
    label: 'is greater than',
    value: '? > ?',
    argumentArity: 'one-arg'
  },
  {
    label: 'is greater than or equal to',
    value: '? >= ?',
    argumentArity: 'one-arg'
  },
  {
    label: 'is less than',
    value: '? < ?',
    argumentArity: 'one-arg'
  },
  {
    label: 'is less than or equal to',
    value: '? <= ?',
    argumentArity: 'one-arg'
  },
  {
    label: 'starts with',
    value: '? starts with ?',
    argumentArity: 'one-arg',
    forColumnType: 'hierarchy'
  },
  {
    label: 'not starts with',
    value: '? not starts with ?',
    argumentArity: 'one-arg',
    forColumnType: 'hierarchy'
  },
  {
    label: 'ends with',
    value: '? ends with ?',
    argumentArity: 'one-arg',
    forColumnType: 'hierarchy'
  },
  {
    label: 'not ends with',
    value: '? not ends with ?',
    argumentArity: 'one-arg',
    forColumnType: 'hierarchy'
  },
  {
    label: 'is known',
    value: '? is not null',
    argumentArity: 'no-args'
  },
  {
    label: 'is not known',
    value: '? is null',
    argumentArity: 'no-args'
  }
] satisfies FilterOption[];

function getArgumentArity(filterExpression: string | null): ArgumentArity {
  if (!filterExpression) {
    return 'no-args';
  }
  return FILTER_OPTIONS.find(option => option.value === filterExpression)?.argumentArity ?? 'no-args';
}

export type FilterSlot = {
  label: { en: string },
  set: string
  column: string,
  filter: Filter | null,
  type: string,
}

@Component({
  selector: 'app-filters-panel',
  standalone: true,
  imports: [
    CdkDropList,
    MatIcon,
    MatButton,
    MatIconButton,
    MatFormField,
    MatSelect,
    MatOption,
    MatLabel,
    FormsModule,
    MatTooltip,
  ],
  templateUrl: './filters-panel.component.html',
  styleUrl: './filters-panel.component.scss'
})
export class FiltersPanelComponent {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly chartService = inject(ChartService);
  // filters: FilterSlot[] = [];
  filters = this.chartService.filters;

  // selectedFilterOption = signal('and');
  selectedFilterOption = this.chartService.filterOperator;

  readonly filterOptions = [
    { value: 'and', label: 'ALL of the filters below' },
    { value: 'or', label: 'ANY of the filters below' },
  ]

  protected readonly columnTypeIcons = COLUMN_TYPE_ICONS;

  readonly dialog = inject(MatDialog);

  constructor() {
    toObservable(this.selectedFilterOption)
        .pipe(
            takeUntilDestroyed(this.destroyRef),
            skip(1)
        )
        .subscribe(() => {
          if (this.filters().length > 0) {
            this.updateChartFilters();
          }
        });
  }

  drop(event: CdkDragDrop<string[]>) {
    const column = event.item.data;
    const filter = {
      label: column.name,
      set: column.securable_id,
      column: column.id,
      filter: null,
      type: column.type,
    };

    this.chartService.updateFilters([...this.chartService.filters(), filter]);

    this.onClickFilter(this.filters().length - 1, filter);
  }

  removeColumnFromFilters(event: any, indexToRemove: number) {
    event.stopPropagation();
    const filtered = this.filters().filter((_, index) => index !== indexToRemove);
    this.chartService.updateFilters(filtered);
    this.updateChartFilters();
  }

  /*private transformToFlexFilters() {
    const filters = this.filters
        .filter((filterSlot) => filterSlot.filter !== null)
        .map((filterSlot) => {
      const dataset_id = filterSlot.set;
      const column_id = filterSlot.column;
      const expression = filterSlot.filter?.expression!;
      const args = filterSlot.filter?.arguments ?? null;

      const parameters = [
        {
          column_id,
          dataset_id,
        }
      ] as any[];

      if (args) {
        const columnType = filterSlot.type;
        let typedArgs: Value | Value[];
        if (columnType === 'numeric') {
          if (Array.isArray(args)) {
            typedArgs = args.map((arg: string) => parseFloat(arg));
          } else {
            typedArgs = parseFloat(args);
          }
        } else {
          typedArgs = args;
        }
        parameters.push(typedArgs);
      }

      return {
        expression,
        parameters
      };
    });

    return [
      {
        condition: this.selectedFilterOption(),
        filters: filters,
      },
    ];
  }*/

  onClickFilter(idx: number, filter: FilterSlot) {
    const height = filter.type === 'numeric' ? '660px' : '800px';
    const dialogRef = this.dialog.open(FilterEditorDialog, {
      data: {columnName: filter.label.en, filter: filter.filter, filterIndex: idx, columnType: filter.type},
      height,
      width: '600px',
    });

    dialogRef.afterClosed()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(result => {
          if (result) {
            const copied = this.filters();
            copied[result.filterIndex].filter = result.filter;
            this.chartService.updateFilters(copied);
            // this.updateChartFilters();
          }
        });
  }

  updateChartFilters() {
    // const flexFilters = this.transformToFlexFilters();
    // this.chartService.updateFilters(this.filters);
  }
}

type Filter = {
  expression: string;
  arguments: string | string[];
};

export interface DialogData {
  filter: Filter | null;
  filterIndex: number;
  columnName: string;
  columnType: string;
}

@Component({
  selector: 'filter-editor-dialog',
  templateUrl: 'filter-editor-dialog.html',
  styleUrl: 'filter-editor-dialog.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatRadioGroup,
    MatRadioButton,
    MatIcon,
    ReactiveFormsModule,
    MatChipGrid,
    MatChipRow,
    MatChipInput,
    MatChipRemove,
  ],
})
export class FilterEditorDialog implements OnInit {
  readonly dialogRef = inject(MatDialogRef<FilterEditorDialog>);
  readonly announcer = inject(LiveAnnouncer);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  readonly currentFilterExpression = model(this.data.filter?.expression ?? null);
  readonly currentFilterArgumentArity = computed(() => {
    return getArgumentArity(this.currentFilterExpression());
  }, {
    equal: () => false,
  });
  readonly inputType = this.data.columnType === 'numeric' ? 'number' : 'text';

  readonly addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  readonly multipleArgs = signal<string[]>([]);

  readonly singleArg = signal<string>('');

  addMultipleArg(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.multipleArgs.update(args => [...args, value]);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  removeMultipleArg(arg: string): void {
    this.multipleArgs.update(args => {
      const index = args.indexOf(arg);
      if (index < 0) {
        return args;
      }

      args.splice(index, 1);
      void this.announcer.announce(`Removed ${arg}`);
      return [...args];
    });
  }

  edit(arg: string, event: MatChipEditedEvent) {
    const value = event.value.trim();

    if (!value) {
      this.removeMultipleArg(arg);
      return;
    }

    this.multipleArgs.update(args => {
      const index = args.indexOf(arg);
      if (index >= 0) {
        args[index] = value;
        return [...args];
      }
      return args;
    });
  }

  readonly filterOptions = FILTER_OPTIONS.filter(({ forColumnType }) =>
    !forColumnType || forColumnType === this.data.columnType
  );

  constructor() {
    const expr = this.currentFilterExpression();
    const arity = getArgumentArity(expr);
    if (arity === 'one-arg') {
      this.singleArg.set(this.data.filter.arguments as string);
    } else if (arity === 'multiple-args') {
      this.multipleArgs.set(this.data.filter.arguments as string[]);
    }

    const arityObservable = toObservable(this.currentFilterArgumentArity)
        .pipe(
            takeUntilDestroyed(),
            skip(1)
        );
    arityObservable.subscribe(() => {
      this.multipleArgs.set([]);
      this.singleArg.set('');
    });
  }

  ngOnInit() {
  }

  onNoClick() {
    this.dialogRef.close();
  }

  getDialogResult() {
    const filterIndex = this.data.filterIndex;
    const expression = this.currentFilterExpression();
    const argumentArity = getArgumentArity(expression);
    let args: string | string[] | null = null;
    if (argumentArity === 'one-arg') {
      args = this.singleArg();
    } else if (argumentArity === 'multiple-args') {
      args = this.multipleArgs();
    }
    const filter = {
      expression: expression,
      arguments: args,
    };

    return {
      filterIndex,
      filter,
    }
  }

  protected readonly columnTypeIcons = COLUMN_TYPE_ICONS;
}
