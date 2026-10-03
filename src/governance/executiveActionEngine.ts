/**
 * EXECUTION-03 — Executive Action Engine
 * Derives concrete decisions required from executives, customized by leadership role.
 */

import { Initiative } from '../types';
import { Intervention, Owner, ExecutiveAction, ExecutiveActionType, LeadershipRole } from './types';

export function deriveExecutiveAction(
  initiative: Initiative,
  intervention: Intervention,
  owner: Owner
): ExecutiveAction {
  const type = intervention.type;
  const urgency = intervention.urgency;

  let actionType: ExecutiveActionType = 'NO_ACTION_NEEDED';
  let actionText = 'لا يتطلب قراراً استثنائياً حالياً، المتابعة الروتينية قائمة.';
  let requiredRole: LeadershipRole = 'local_director';

  if (type === 'SUPPLY_INTERVENTION') {
    actionType = 'PROCUREMENT_APPROVAL';
    actionText = `إصدار توجيه عاجل إلى ${owner.name} لتفريغ شحنة الأسمنت والديزل المقررة للمبادرة وحمايتها من التلف.`;
    requiredRole = 'unit_head';
  } else if (type === 'TECHNICAL_ASSESSMENT') {
    actionType = 'TECHNICAL_INSPECTION_ORDER';
    actionText = `تكليف ${owner.name} بالنزول الهندسي وتعديل دراسة الجدران والمقطع الميداني خلال 5 أيام.`;
    requiredRole = 'engineer';
  } else if (type === 'DOCUMENTATION_CLOSURE') {
    actionType = 'DOCUMENTATION_SIGN_OFF';
    actionText = `اعتماد وتوقيع محضر الفرز النهائي وإغلاق السجل المستندي للمبادرة رسمياً.`;
    requiredRole = 'executive';
  } else if (type === 'COMMUNITY_MEDIATION') {
    actionType = 'COMMUNITY_RECONCILIATION';
    actionText = `دعوة أطراف المبادرة للصلح الميداني واعتماد مسار الطريق المتفق عليه بالسلطة المحلية.`;
    requiredRole = 'local_director';
  } else if (type === 'FINANCIAL_ALLOCATION') {
    actionType = 'DIRECTIVE_ISSUANCE';
    actionText = `الموافقة الإدارية على صرف الموازنة المعتمدة لاستكمال أعمال الرصف التنموية.`;
    requiredRole = 'governor';
  } else if (type === 'FIELD_EVALUATION') {
    actionType = 'TECHNICAL_INSPECTION_ORDER';
    actionText = `توجيه فريق الرصد الميداني لإجراء التقييم الشامل ورفع تقرير الفرز للقيادة.`;
    requiredRole = 'unit_head';
  } else if (type === 'ADMINISTRATIVE_DECISION') {
    actionType = 'DIRECTIVE_ISSUANCE';
    actionText = `إصدار قرار تنظيمي يحدد خطة العمل والإشراف الميداني في المديرية.`;
    requiredRole = 'governor';
  }

  return {
    actionType,
    actionText,
    requiredRole,
    urgency,
  };
}
