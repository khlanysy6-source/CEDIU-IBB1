import { Initiative } from '../types';

export interface LeadershipScoreBreakdown { total:number; execution:number; risk:number; impact:number; dataConfidence:number; readiness:number; }

export function leadershipScore(i:Initiative):LeadershipScoreBreakdown {
  const completion=Math.max(0,Math.min(100,Number(i.completionRate)||0));
  const execution=Math.round(completion*.35);
  const risk=i.status==='stagnant'||i.status==='stopped'?5:i.status==='pending'?12:22;
  const beneficiaries=Math.min(100,Math.sqrt(Math.max(0,Number(i.beneficiaries)||0))/10);
  const impact=Math.round(beneficiaries*.15 + (Number(i.impactScore)||0)*.05);
  const dataConfidence=Math.round((i.updatedAt?10:4)+(i.ownerConfirmed?5:0)+(i.coordinates?5:0));
  const readiness=i.status==='ongoing'?10:i.status==='pending'?5:i.status==='completed'?15:3;
  const total=Math.max(0,Math.min(100,execution+risk+impact+dataConfidence+readiness));
  return {total,execution,risk,impact,dataConfidence,readiness};
}
