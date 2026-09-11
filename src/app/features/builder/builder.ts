import {
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { form, FormField } from '@angular/forms/signals';
import { switchMap, catchError, of, startWith } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CATEGORY_META } from '../../core/config/categories';
import { Part, PartCategory } from '../../core/models/part.model';
import { BuildService } from '../../core/services/build.service';
import { PartsService } from '../../core/services/parts.service';
import { PartCard } from '../../shared/part-card/part-card';
import { PricePipe } from '../../shared/pipes/price.pipe';

@Component({
  selector: 'app-builder',
  imports: [
    FormField,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PartCard,
    PricePipe,
  ],
  templateUrl: './builder.html',
  styleUrl: './builder.css',
})
export class Builder {
  private readonly partsService = inject(PartsService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly build = inject(BuildService);
  protected readonly categories = CATEGORY_META;
  protected readonly activeCategory = signal<PartCategory>('cpu');
  protected readonly loading = signal(false);
  protected readonly parts = signal<Part[]>([]);
  protected readonly error = signal<string | null>(null);

  protected readonly filterModel = signal({
    q: '',
    maxPrice: 0,
  });

  protected readonly filterForm = form(this.filterModel);

  protected readonly activeMeta = computed(
    () => this.categories.find((c) => c.id === this.activeCategory())!,
  );

  protected readonly selectedForCategory = computed(
    () => this.build.slots()[this.activeCategory()],
  );

  constructor() {
    const reload$ = toObservable(
      computed(() => ({
        category: this.activeCategory(),
        q: this.filterModel().q.trim() || null,
        maxPrice: this.filterModel().maxPrice || null,
      })),
    );

    reload$
      .pipe(
        switchMap((query) => {
          this.loading.set(true);
          this.error.set(null);
          return this.partsService.getParts(query).pipe(
            catchError(() => {
              this.error.set('Failed to load parts. Is MSW running?');
              return of({ items: [], total: 0 });
            }),
            startWith(null),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        if (res == null) return;
        this.parts.set(res.items);
        this.loading.set(false);
      });

  }

  protected setCategory(category: PartCategory): void {
    this.activeCategory.set(category);
  }

  protected onSelect(part: Part): void {
    this.build.select(part);
    this.snackBar.open(`Selected ${part.name}`, 'OK', { duration: 1800 });
  }

  protected onClear(part: Part): void {
    this.build.clear(part.category);
  }

  protected clearSlot(category: PartCategory): void {
    this.build.clear(category);
  }

  protected clearFilters(): void {
    this.filterModel.set({ q: '', maxPrice: 0 });
  }
}
