export interface OfflineOperation { id:string; type:string; payload:unknown; createdAt:string; attempts:number; }
const KEY='cooperative_offline_operations_v1';
function read():OfflineOperation[]{ try { const raw=localStorage.getItem(KEY); return raw?JSON.parse(raw):[]; } catch { return []; } }
function write(items:OfflineOperation[]){ localStorage.setItem(KEY,JSON.stringify(items)); }
export function enqueueOfflineOperation(type:string,payload:unknown){ const items=read(); items.push({id:`op_${Date.now()}_${String(Date.now()).slice(-7)}`,type,payload,createdAt:new Date().toISOString(),attempts:0}); write(items); return items[items.length-1]; }
export function getOfflineQueue(){ return read(); }
export function clearOfflineQueue(){ write([]); }
export async function flushOfflineQueue(handler:(op:OfflineOperation)=>Promise<void>){ const items=read(); const remaining:OfflineOperation[]=[]; for(const op of items){ try{await handler(op);}catch{remaining.push({...op,attempts:op.attempts+1});} } write(remaining); return {processed:items.length-remaining.length,remaining:remaining.length}; }
