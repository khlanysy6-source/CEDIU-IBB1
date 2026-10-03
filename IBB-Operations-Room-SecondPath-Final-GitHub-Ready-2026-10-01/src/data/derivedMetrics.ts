/**
 * @file Derived Metrics Bridge
 * Bridges legacy calls to the Central Mathematical Truth Engine (محرك الحقيقة الحسابية).
 */

import { Initiative } from '../types';
import { DataSourceTag, FieldWithProvenance } from './schema';
import { حساب_محرك_الحقيقة_الحسابية, تفاصيل_المؤشرات_الحسابية } from '../utils/calculationTruthEngine';
import { parseNum } from '../utils/numberAndDistrictUtils';

export interface DistrictMetricSummary {
  district: string;
  totalInitiatives: number;
  completed: number;
  ongoing: number;
  stagnant: number;
  stopped: number;
  pending: number;
  totalCost: number;
  communityContribution: number;
  unitContribution: number;
  cementDisbursedBags: number;
  dieselDisbursedLiters: number;
  completionRateAverage: number;
}

export interface PlatformDerivedMetrics {
  totalInitiatives: FieldWithProvenance<number>;
  statusBreakdown: {
    completed: FieldWithProvenance<number>;
    ongoing: FieldWithProvenance<number>;
    stagnant: FieldWithProvenance<number>;
    stopped: FieldWithProvenance<number>;
    pending: FieldWithProvenance<number>;
  };
  financials: {
    totalCost: FieldWithProvenance<number>;
    totalCommunityContribution: FieldWithProvenance<number>;
    totalUnitContribution: FieldWithProvenance<number>;
    totalExecutedCost: FieldWithProvenance<number>;
    communityContributionPercentage: FieldWithProvenance<number>;
  };
  materials: {
    totalCementApprovedBags: FieldWithProvenance<number>;
    totalCementDisbursedBags: FieldWithProvenance<number>;
    totalCementUsedBags: FieldWithProvenance<number>;
    totalCementRemainingUnitBags: FieldWithProvenance<number>;
    totalCementRemainingInitiativeBags: FieldWithProvenance<number>;
    totalDieselApprovedLiters: FieldWithProvenance<number>;
    totalDieselDisbursedLiters: FieldWithProvenance<number>;
    totalDieselUsedLiters: FieldWithProvenance<number>;
    totalDieselRemainingUnitLiters: FieldWithProvenance<number>;
    totalDieselRemainingInitiativeLiters: FieldWithProvenance<number>;
  };
  beneficiaries: {
    totalEstimatedBeneficiaries: FieldWithProvenance<number>;
    averageBeneficiariesPerInitiative: FieldWithProvenance<number>;
  };
  districtSummaries: DistrictMetricSummary[];
  mathEngine: تفاصيل_المؤشرات_الحسابية;
}

export function computeDerivedMetrics(initiatives: Initiative[]): PlatformDerivedMetrics {
  const math = حساب_محرك_الحقيقة_الحسابية(initiatives);

  // District Aggregation (Consistently using the same normalization)
  const districtMap = new Map<string, DistrictMetricSummary>();

  for (const item of initiatives) {
    const dist = item.district || 'غير محدد';
    let dSummary = districtMap.get(dist);
    if (!dSummary) {
      dSummary = {
        district: dist,
        totalInitiatives: 0,
        completed: 0,
        ongoing: 0,
        stagnant: 0,
        stopped: 0,
        pending: 0,
        totalCost: 0,
        communityContribution: 0,
        unitContribution: 0,
        cementDisbursedBags: 0,
        dieselDisbursedLiters: 0,
        completionRateAverage: 0
      };
      districtMap.set(dist, dSummary);
    }

    dSummary.totalInitiatives++;
    if (item.status === 'completed') dSummary.completed++;
    else if (item.status === 'ongoing') dSummary.ongoing++;
    else if (item.status === 'stagnant') dSummary.stagnant++;
    else if (item.status === 'stopped') dSummary.stopped++;
    else if (item.status === 'pending') dSummary.pending++;

    const c = parseNum(item.cost) || parseNum(item.estimatedCost) || 0;
    const comm = parseNum(item.communityContribution) || 0;
    const u = parseNum(item.unitContribution) || 0;
    const cDisb = parseNum(item.materialsDisbursed) || 0;
    const dDisb = parseNum(item.dieselDisbursed) || 0;

    dSummary.totalCost += c;
    dSummary.communityContribution += comm;
    dSummary.unitContribution += u;
    dSummary.cementDisbursedBags += cDisb;
    dSummary.dieselDisbursedLiters += dDisb;
  }

  // Calculate completion averages per district
  for (const dSummary of districtMap.values()) {
    const distItems = initiatives.filter(i => (i.district || 'غير محدد') === dSummary.district);
    const sumRate = distItems.reduce((acc, i) => acc + (parseNum(i.completionRate) || 0), 0);
    dSummary.completionRateAverage = distItems.length > 0 ? Math.round(sumRate / distItems.length) : 0;
  }

  return {
    totalInitiatives: {
      value: math.إجمالي_المبادرات,
      source: 'source',
      provenanceNote: 'العدد الكلي الفعلي لسجلات المبادرات المعتمدة في قاعدة البيانات'
    },
    statusBreakdown: {
      completed: { value: math.المبادرات_المكتملة, source: 'calculated' },
      ongoing: { value: math.المبادرات_الجارية, source: 'calculated' },
      stagnant: { value: math.المبادرات_المتعثرة, source: 'calculated' },
      stopped: { value: math.المبادرات_المتوقفة, source: 'calculated' },
      pending: { value: math.المبادرات_المعلقة_قيد_التجهيز, source: 'calculated' }
    },
    financials: {
      totalCost: { value: math.إجمالي_التكلفة_حسب_الدراسة, source: 'calculated' },
      totalCommunityContribution: { value: math.إجمالي_مساهمة_المجتمع, source: 'calculated' },
      totalUnitContribution: { value: math.إجمالي_مساهمة_الوحدة, source: 'calculated' },
      totalExecutedCost: { value: math.إجمالي_تكلفة_الأعمال_المنفذة, source: 'calculated' },
      communityContributionPercentage: { value: math.نسبة_مساهمة_المجتمع_الإجمالية, source: 'calculated' }
    },
    materials: {
      totalCementApprovedBags: { value: math.إجمالي_الإسمنت_المعتمد, source: 'calculated' },
      totalCementDisbursedBags: { value: math.إجمالي_الإسمنت_المنصرف, source: 'calculated' },
      totalCementUsedBags: { value: math.إجمالي_الإسمنت_المستخدم, source: 'calculated' },
      totalCementRemainingUnitBags: { value: math.رصيد_الإسمنت_لدى_الوحدة, source: 'calculated' },
      totalCementRemainingInitiativeBags: { value: math.رصيد_الإسمنت_لدى_المبادرات, source: 'calculated' },
      totalDieselApprovedLiters: { value: math.إجمالي_الديزل_المعتمد, source: 'calculated' },
      totalDieselDisbursedLiters: { value: math.إجمالي_الديزل_المنصرف, source: 'calculated' },
      totalDieselUsedLiters: { value: math.إجمالي_الديزل_المستخدم, source: 'calculated' },
      totalDieselRemainingUnitLiters: { value: math.رصيد_الديزل_لدى_الوحدة, source: 'calculated' },
      totalDieselRemainingInitiativeLiters: { value: math.رصيد_الديزل_لدى_المبادرات, source: 'calculated' },
    },
    beneficiaries: {
      totalEstimatedBeneficiaries: { value: math.إجمالي_المستفيدين_المقدر, source: 'calculated' },
      averageBeneficiariesPerInitiative: { value: math.متوسط_المستفيدين_لكل_مبادرة, source: 'calculated' }
    },
    districtSummaries: Array.from(districtMap.values()),
    mathEngine: math
  };
}
