function CACHE_write(item){
  var sh=Helpers_getOrCreateSheet_('generation_cache');
  var header=Helpers_ensureHeader_(sh,['cache_id','date','platform','format','subtype','topic','draft','qa_scores_json','published','published_url']);
  var idx=Helpers_index_(header);
  var row=new Array(header.length).fill('');
  row[idx.cache_id]=item.cache_id||Utilities.getUuid();
  row[idx.date]=item.date||Utilities.formatDate(new Date(), Session.getScriptTimeZone(),'yyyy-MM-dd');
  row[idx.platform]=item.platform||''; row[idx.format]=item.format||''; row[idx.subtype]=item.subtype||''; row[idx.topic]=item.topic||'';
  row[idx.draft]=item.draft||''; row[idx.qa_scores_json]=JSON.stringify(item.qa||{});
  row[idx.published]=item.published||false; row[idx.published_url]=item.published_url||'';
  sh.appendRow(row); return {ok:true, cache_id:row[idx.cache_id]};
}
function CACHE_readByTopic(topic){
  var sh=Helpers_getOrCreateSheet_('generation_cache'); var vals=sh.getDataRange().getValues(); if(vals.length<2) return [];
  var header=vals[0], idx=Helpers_index_(header), out=[];
  for(var r=1;r<vals.length;r++){ if(String(vals[r][idx.topic]).toLowerCase()===String(topic||'').toLowerCase()) out.push(vals[r]); }
  return out;
}
function CACHE_listRecent(limit){
  var sh=Helpers_getOrCreateSheet_('generation_cache'); var vals=sh.getDataRange().getValues(); if(vals.length<2) return [];
  var header=vals[0]; var body=vals.slice(1); body.reverse(); return body.slice(0, Math.max(1, limit||20));
}
function CACHE_updateStatus(p){
  var sh=Helpers_getOrCreateSheet_('generation_cache'); var vals=sh.getDataRange().getValues(); if(vals.length<2) return {ok:false,msg:'empty'};
  var header=vals[0], idx=Helpers_index_(header);
  for(var r=1;r<vals.length;r++){
    if(String(vals[r][idx.cache_id])===String(p.cache_id)){
      if(p.published!=null) sh.getRange(r+0, idx.published+1).setValue(!!p.published);
      if(p.published_url!=null) sh.getRange(r+0, idx.published_url+1).setValue(p.published_url);
      return {ok:true};
    }
  }
  return {ok:false,msg:'not found'};
}
