function Helpers_getOrCreateSheet_(name){ var ss=SpreadsheetApp.getActive(); return ss.getSheetByName(name)||ss.insertSheet(name); }
function Helpers_ensureHeader_(sh, header){
  var rng=sh.getDataRange();
  if(rng.getNumRows()<1||rng.getValues().length<1){ sh.appendRow(header); return header; }
  var got=rng.getValues()[0]; if(got.join('\t')!==header.join('\t')){ sh.insertRowBefore(1); sh.getRange(1,1,1,header.length).setValues([header]); }
  return header;
}
function Helpers_index_(header){ var idx={}; header.forEach(function(h,i){ idx[h]=i; }); return idx; }
function Helpers_findRow_(sh, key, value){
  var vals=sh.getDataRange().getValues(); if(vals.length<2) return {index:-1,rowNum:-1,idx:Helpers_index_(vals[0]||[]),values:[]};
  var header=vals[0], idx=Helpers_index_(header);
  for(var r=1;r<vals.length;r++){ if(String(vals[r][idx[key]])===String(value)){ return {index:r-1,rowNum:r,idx:idx,values:vals[r]}; }
  }
  return {index:-1,rowNum:-1,idx:idx,values:[]};
}
function Helpers_nowISO_(){ return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss'Z'"); }
