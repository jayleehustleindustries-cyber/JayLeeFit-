import type { TierId } from '../staleness/config';
import type { MarketplaceId } from '../staleness/config';

export type HealthGrade = 'green' | 'yellow' | 'red';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface ItemHealth {
  sku: string;
  brand: string;
  garment: string;
  score: number;
  grade: HealthGrade;
  issues: string[];
  hasPhoto: boolean;
  hasEbayLink: boolean;
  hasPoshmarkLink: boolean;
  hasPrice: boolean;
  hasCondition: boolean;
  tier: TierId;
  daysInInventory: number;
  status: string;
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  category: string;
  message: string;
  items?: string[];
  actionable: boolean;
  suggestedAction?: string;
}

export interface PipelineStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down' | 'unconfigured';
  lastRun: string | null;
  detail: string;
}

export interface TierBreakdown {
  tier: TierId;
  label: string;
  count: number;
  totalValue: number;
  avgDays: number;
}

export interface InventoryMetrics {
  totalItems: number;
  activeItems: number;
  soldItems: number;
  avgDaysInInventory: number;
  avgListedPrice: number;
  totalListedValue: number;
  totalLadderValue: number;
  potentialRecovery: number;
  completenessScore: number;
  tierBreakdown: TierBreakdown[];
}

export interface OpsHealthReport {
  generatedAt: string;
  overallGrade: HealthGrade;
  metrics: InventoryMetrics;
  pipelines: PipelineStatus[];
  alerts: Alert[];
  items: ItemHealth[];
}
