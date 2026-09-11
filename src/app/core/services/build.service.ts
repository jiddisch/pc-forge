import { Injectable, computed, signal } from '@angular/core';
import {
  BuildSlots,
  Part,
  PartCategory,
  REQUIRED_CATEGORIES,
} from '../models/part.model';

const emptyBuild = (): BuildSlots => ({
  cpu: null,
  motherboard: null,
  memory: null,
  storage: null,
  gpu: null,
  psu: null,
  case: null,
  cooling: null,
});

export interface CompatibilityIssue {
  severity: 'warning' | 'error';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class BuildService {
  readonly slots = signal<BuildSlots>(emptyBuild());

  readonly totalPrice = computed(() =>
    Object.values(this.slots()).reduce((sum, part) => sum + (part?.price ?? 0), 0),
  );

  readonly selectedCount = computed(
    () => Object.values(this.slots()).filter(Boolean).length,
  );

  readonly hasIntegratedGraphics = computed(() => {
    const cpu = this.slots().cpu;
    return Boolean(cpu?.specs?.integratedGraphics);
  });

  readonly gpuRequired = computed(() => !this.hasIntegratedGraphics());

  readonly issues = computed<CompatibilityIssue[]>(() => {
    const s = this.slots();
    const issues: CompatibilityIssue[] = [];

    if (s.cpu && s.motherboard) {
      const cpuSocket = s.cpu.specs.socket;
      const mbSocket = s.motherboard.specs.socket;
      if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
        issues.push({
          severity: 'error',
          message: `CPU socket ${cpuSocket} does not match motherboard ${mbSocket}`,
        });
      }
    }

    if (s.motherboard && s.memory) {
      const mbRam = s.motherboard.specs.ramType;
      const ramType = s.memory.specs.ramType;
      if (mbRam && ramType && mbRam !== ramType) {
        issues.push({
          severity: 'error',
          message: `RAM type ${ramType} does not match motherboard ${mbRam}`,
        });
      }
    }

    if (s.cpu && s.memory) {
      const cpuRam = s.cpu.specs.ramType;
      const ramType = s.memory.specs.ramType;
      if (cpuRam && ramType && cpuRam !== ramType) {
        issues.push({
          severity: 'warning',
          message: `CPU prefers ${cpuRam}; selected RAM is ${ramType}`,
        });
      }
    }

    if (s.case && s.cooling) {
      const maxH = Number(s.case.specs.maxCoolerHeightMm);
      const coolH = Number(s.cooling.specs.coolerHeightMm);
      if (maxH && coolH && coolH > maxH) {
        issues.push({
          severity: 'warning',
          message: `Cooler height ${coolH}mm may exceed case limit ${maxH}mm`,
        });
      }
    }

    if (s.case && s.gpu) {
      const maxL = Number(s.case.specs.gpuLengthMm);
      const gpuL = Number(s.gpu.specs.lengthMm);
      if (maxL && gpuL && gpuL > maxL) {
        issues.push({
          severity: 'warning',
          message: `GPU length ${gpuL}mm may exceed case clearance ${maxL}mm`,
        });
      }
    }

    if (!s.gpu && !this.hasIntegratedGraphics() && s.cpu) {
      issues.push({
        severity: 'warning',
        message: 'No discrete GPU and CPU reports no integrated graphics',
      });
    }

    if (s.psu) {
      const estimate =
        Number(s.cpu?.specs.tdpW ?? 0) +
        Number(s.gpu?.specs.tdpW ?? 0) +
        100;
      const wattage = Number(s.psu.specs.wattage ?? 0);
      if (wattage && estimate > wattage * 0.8) {
        issues.push({
          severity: 'warning',
          message: `Estimated load ~${estimate}W is high for a ${wattage}W PSU`,
        });
      }
    }

    return issues;
  });

  readonly isComplete = computed(() => {
    const s = this.slots();
    const requiredOk = REQUIRED_CATEGORIES.every((c) => s[c] != null);
    const gpuOk = s.gpu != null || this.hasIntegratedGraphics();
    return requiredOk && gpuOk && !this.issues().some((i) => i.severity === 'error');
  });

  select(part: Part): void {
    this.slots.update((current) => ({
      ...current,
      [part.category]: part,
    }));
  }

  clear(category: PartCategory): void {
    this.slots.update((current) => ({
      ...current,
      [category]: null,
    }));
  }

  clearAll(): void {
    this.slots.set(emptyBuild());
  }

  isSelected(part: Part): boolean {
    return this.slots()[part.category]?.id === part.id;
  }
}
