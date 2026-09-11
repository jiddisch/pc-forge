import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Part } from '../../core/models/part.model';
import { PricePipe } from '../pipes/price.pipe';

@Component({
  selector: 'app-part-card',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, PricePipe],
  templateUrl: './part-card.html',
  styleUrl: './part-card.css',
})
export class PartCard {
  readonly part = input.required<Part>();
  readonly selected = input(false);
  readonly selectPart = output<Part>();
  readonly clearPart = output<Part>();

  protected specEntries(): { key: string; value: string }[] {
    return Object.entries(this.part().specs)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .slice(0, 4)
      .map(([key, value]) => ({
        key: key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()),
        value: String(value),
      }));
  }
}
