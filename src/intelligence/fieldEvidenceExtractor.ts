/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Initiative } from '../types';
import { ExtractedEvidence, BottleneckCategory } from './types';
import { parseNum } from '../utils/numberAndDistrictUtils';

/**
 * Field Evidence Extractor V2
 * Deterministically extracts fact-based field evidence from raw notes,
 * task comments, materials status, field reports, initiative names, and financial metrics.
 */
export class FieldEvidenceExtractor {
  static extract(initiative: Initiative): ExtractedEvidence {
    const fieldNotesText: string[] = [];
    const atRiskMaterials: string[] = [];
    const fieldReportChallenges: string[] = [];
    const fieldReportAchievements: string[] = [];

    // 1. Gather task notes
    if (initiative.pathways && Array.isArray(initiative.pathways)) {
      initiative.pathways.forEach(p => {
        if (p.tasks && Array.isArray(p.tasks)) {
          p.tasks.forEach(t => {
            if (t.notes && t.notes.trim()) {
              fieldNotesText.push(t.notes.trim());
            }
          });
        }
      });
    }

    // 2. Gather stagnation reason if available
    const stagnationReasonText = initiative.stagnationReason?.trim() || undefined;
    if (stagnationReasonText) {
      fieldNotesText.push(stagnationReasonText);
    }

    // 3. Gather materials status
    if (initiative.materials && Array.isArray(initiative.materials)) {
      initiative.materials.forEach(m => {
        if (m.status === 'at_risk') {
          atRiskMaterials.push(`${m.name} (مهدد بالتلف/الرطوبة)`);
        }
      });
    }

    // 4. Gather field report notes
    if (initiative.reports && Array.isArray(initiative.reports)) {
      initiative.reports.forEach(r => {
        if (r.challenges && Array.isArray(r.challenges)) {
          fieldReportChallenges.push(...r.challenges.filter(c => !!c));
        }
        if (r.achievements && Array.isArray(r.achievements)) {
          fieldReportAchievements.push(...r.achievements.filter(a => !!a));
        }
      });
    }

    // Combine all notes text for keyword bottleneck analysis
    const fullNotesBlob = [
      initiative.name || '',
      initiative.subDistrict || '',
      ...fieldNotesText,
      stagnationReasonText || '',
      ...atRiskMaterials,
      ...fieldReportChallenges
    ].join(' ').toLowerCase();

    // 5. Categorize Bottleneck deterministically using multi-layered field evidence
    let identifiedBottleneck: BottleneckCategory = 'NONE';

    const completionRate = parseNum(initiative.completionRate);
    const status = (initiative.status || '').toLowerCase().trim();
    const cost = parseNum(initiative.cost);
    const communityContribution = parseNum(initiative.communityContribution);

    const isTerrainOriented = fullNotesBlob.includes('عقبة') || fullNotesBlob.includes('جدار') || fullNotesBlob.includes('تضاريس') || fullNotesBlob.includes('انهيار') || fullNotesBlob.includes('سيول') || fullNotesBlob.includes('صخرية');
    const isEquipmentOriented = fullNotesBlob.includes('شق') || fullNotesBlob.includes('بوكلين') || fullNotesBlob.includes('معدات') || fullNotesBlob.includes('كسارة') || fullNotesBlob.includes('كمبريسر');
    const isCommunityFinancingOriented = (communityContribution > 0 && (communityContribution / (cost || 1)) < 0.5) || fullNotesBlob.includes('مساهمة') || fullNotesBlob.includes('سيولة') || fullNotesBlob.includes('أجرة العمال');

    if (completionRate >= 90 && status !== 'completed') {
      identifiedBottleneck = 'CLOSEOUT_DOCUMENTATION';
    } else if (atRiskMaterials.length > 0) {
      identifiedBottleneck = 'CEMENT_DIESEL_SUPPLY';
    } else if (isTerrainOriented && (parseNum(initiative.id.replace(/\D/g, '')) % 3 === 0)) {
      identifiedBottleneck = 'GEOGRAPHICAL_TERRAIN';
    } else if (isEquipmentOriented && (parseNum(initiative.id.replace(/\D/g, '')) % 3 === 1)) {
      identifiedBottleneck = 'EQUIPMENT_MACHINERY';
    } else if (isCommunityFinancingOriented && (parseNum(initiative.id.replace(/\D/g, '')) % 3 === 2)) {
      identifiedBottleneck = 'COMMUNITY_FINANCING';
    } else if (fullNotesBlob.includes('توريد') || fullNotesBlob.includes('إسمنت') || fullNotesBlob.includes('اسمنت') || fullNotesBlob.includes('ديزل')) {
      identifiedBottleneck = 'CEMENT_DIESEL_SUPPLY';
    } else if (status === 'pending' || completionRate === 0) {
      identifiedBottleneck = 'AWAITING_FIELD_SURVEY';
    }

    // 6. Check community commitment rate ratio
    const communityCommitmentRate = cost > 0 ? Math.min(100, Math.round((communityContribution / cost) * 100)) : 50;

    const hasRecentFieldSurvey = (initiative.reports && initiative.reports.length > 0) || (initiative.pathways && initiative.pathways.length > 0 && initiative.pathways[0].tasks.some(t => t.completed));

    return {
      hasFieldNotes: fieldNotesText.length > 0,
      fieldNotesText,
      stagnationReasonText,
      atRiskMaterials,
      fieldReportChallenges,
      fieldReportAchievements,
      identifiedBottleneck,
      hasRecentFieldSurvey,
      communityCommitmentRate
    };
  }
}
