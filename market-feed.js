'use strict';
// Read-only importer for independently published market data. Does not send agent cookies.
const net=require('node:net');
function endpointFor(name, config){
 const mapping=JSON.parse(config||'{}'); const value=mapping[name];
 if(!value)return null;
 const u=new URL(value);
 if(u.protocol!=='https:'||u.username||u.password||u.hash||net.isIP(u.hostname)||u.hostname==='localhost'||u.hostname.endsWith('.local')||u.hostname.endsWith('.internal'))throw Error('Feed URL must be a public HTTPS hostname');
 return u.href;
}
function normalizeRecords(payload, website){
 const rows=Array.isArray(payload)?payload:payload?.markets;
 if(!Array.isArray(rows)||rows.length>400||rows.length===0)throw Error('Expected 1–400 markets');
 const now=new Date().toISOString();
 return rows.map(x=>{
  const market=String(x.name||'').trim().toUpperCase(), marketId=String(x.marketId||'').trim(), period=String(x.period||'').trim(),date=String(x.date||'').trim(),status=String(x.status||'UNKNOWN').trim().toUpperCase(),result=x.result==null?'':String(x.result).trim();
  if(!/^[A-Z0-9 _.-]{2,80}$/.test(market)||!/^[A-Za-z0-9_-]{1,40}$/.test(marketId)||!/^[A-Za-z0-9_-]{1,32}$/.test(period)||!/^(\d{4})-(\d{2})-(\d{2})$/.test(date)||!Number.isFinite(Date.parse(date+'T00:00:00Z'))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date||!['BUKA','TUTUP','SELESAI','UNKNOWN'].includes(status)||!(status==='SELESAI'?/^\d{4}$/.test(result):result===''))throw Error('Invalid market feed record');
  return {websiteId:website.id,websiteName:website.name,market,marketId,period,date,status,result,at:now,source:'published_feed'};
 });
}
function mergeRecords(existing, incoming){
 const next=existing.slice();
 for(const r of incoming){const i=next.findIndex(x=>x.websiteId===r.websiteId&&x.marketId===r.marketId&&x.period===r.period&&x.date===r.date);
 if(i>=0){if(next[i].status==='SELESAI'&&(r.status!=='SELESAI'||r.result!==next[i].result))throw Error('Published result conflict');next[i]=r}else next.push(r)}
 return next.slice(-10000);
}
async function readFeed(url, fetcher=fetch){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
 try{const response=await fetcher(url,{method:'GET',redirect:'error',headers:{accept:'application/json'},signal:controller.signal});if(!response.ok)throw Error('Feed HTTP '+response.status);if(!(response.headers.get('content-type')||'').includes('application/json'))throw Error('Feed did not return JSON');const str=await response.text();if(str.length>250000)throw Error('Feed too large');return JSON.parse(str)}finally{clearTimeout(timer)}
}
module.exports={endpointFor,normalizeRecords,mergeRecords,readFeed};
