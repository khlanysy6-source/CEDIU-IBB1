/**
 * Form Data Resolver
 * Maps canonical initiative records and material ledgers into standardized form payload.
 */

import { Initiative } from '../types';
import { materialLedgerTransactions, MaterialLedgerTransaction } from '../data/materialLedgers';

function num(val: any): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

export interface ResolvedFormData {
  id: string;
  number: string;
  name: string;
  district: string;
  subDistrict: string;
  village: string;
  status: string;
  completion: number;
  cost: number | string;
  community: number | string;
  unit: number | string;
  updatedAt: string;
  ledger: {
    cement: {
      rows: number;
      incoming: number;
      outgoing: number;
      lastBalance: number;
    };
    diesel: {
      rows: number;
      incoming: number;
      outgoing: number;
      lastBalance: number;
    };
    transactions: MaterialLedgerTransaction[];
  };
}

export function resolveFormData(initiative: Initiative): ResolvedFormData {
  // Find linked material ledger transactions
  const matched = materialLedgerTransactions.filter(tx => {
    return (
      (tx.initiativeId && tx.initiativeId === initiative.id) ||
      (tx.initiativeNumber && String(tx.initiativeNumber).trim() === String(initiative.initiativeNumber).trim()) ||
      (tx.projectName && initiative.name && tx.projectName.trim() === initiative.name.trim())
    );
  });

  const cementTx = matched.filter(t => t.kind === 'cement');
  const dieselTx = matched.filter(t => t.kind === 'diesel');

  const cementIncoming = cementTx.reduce((sum, t) => sum + num(t.incomingQty), 0);
  const cementOutgoing = cementTx.reduce((sum, t) => sum + num(t.outgoingQty), 0);
  const cementLastBalance = cementTx.length > 0 ? num(cementTx[cementTx.length - 1].balanceQty) : 0;

  const dieselIncoming = dieselTx.reduce((sum, t) => sum + num(t.incomingQty), 0);
  const dieselOutgoing = dieselTx.reduce((sum, t) => sum + num(t.outgoingQty), 0);
  const dieselLastBalance = dieselTx.length > 0 ? num(dieselTx[dieselTx.length - 1].balanceQty) : 0;

  return {
    id: initiative.id,
    number: initiative.initiativeNumber || initiative.id,
    name: initiative.name,
    district: initiative.district,
    subDistrict: initiative.subDistrict || '',
    village: initiative.village || '',
    status: initiative.status,
    completion: num(initiative.completionRate),
    cost: initiative.cost || 0,
    community: initiative.communityContribution || 0,
    unit: initiative.unitContribution || 0,
    updatedAt: initiative.updatedAt || new Date().toISOString().split('T')[0],
    ledger: {
      cement: {
        rows: cementTx.length,
        incoming: cementIncoming,
        outgoing: cementOutgoing,
        lastBalance: cementLastBalance
      },
      diesel: {
        rows: dieselTx.length,
        incoming: dieselIncoming,
        outgoing: dieselOutgoing,
        lastBalance: dieselLastBalance
      },
      transactions: matched
    }
  };
}
