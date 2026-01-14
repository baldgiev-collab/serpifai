function PIPE_generateAllFromCalendar(p){
  var pr=PM_loadProject({project_id:(p&&p.project_id)||'active'});
  var calSh=Helpers_getOrCreateSheet_('calendar');
  var header=Helpers_ensureHeader_(calSh,['date','platform','format','subtype','topic','status','published_url']);
  var vals=calSh.getDataRange().getValues(); if(vals.length<2) return {ok:false,msg:'empty calendar'};
  var idx=Helpers_index_(vals[0]); var out=[];
  for(var r=1;r<vals.length;r++){
    var row=vals[r]; if(row[idx.status] && String(row[idx.status]).toLowerCase()==='published') continue;
    var payload={date:row[idx.date], platform:row[idx.platform], format:row[idx.format], subtype:row[idx.subtype], topic:row[idx.topic]};
    var gen=CE_articleGenerate(payload); var qa=QA_router({text:gen.body, project_id:pr.project_id});
    var cache=CACHE_write({date:payload.date, platform:payload.platform, format:payload.format, subtype:payload.subtype, topic:payload.topic, draft:gen.body, qa:qa, published:false});
    out.push({payload:payload, qa:qa, cache_id:cache.cache_id}); calSh.getRange(r+1, idx.status+1).setValue('drafted');
  }
  return {ok:true, items:out};
}
function PIPE_qaAndImprove(p){
  var items=p&&p.items||[]; var improved=[];
  for(var i=0;i<items.length;i++){
    var body=String(items[i].draft||'');
    var critique='Improve clarity, add FAQ if missing, ensure on-page SEO and EEAT, return improved body only.\n'+body;
    var res=APIS_gemini(critique,{maxTokens:1500,temperature:0.4});
    improved.push(Object.assign({}, items[i], {draft:res.text||body}));
  }
  return {ok:true, items:improved};
}
function PIPE_publishBatch(p){
  var items=p&&p.items||[]; var published=[];
  for(var i=0;i<items.length;i++){
    var map=WP_map({topic:items[i].topic, pillar:items[i].format});
    var post={title:items[i].topic, content:items[i].draft, status:'draft', categories:[map.category], tags:map.tags};
    var res=PUB_wordpressPublish(post);
    published.push({topic:items[i].topic, ok:res.ok, status:res.status, body:res.body});
  }
  return {ok:true, results:published};
}
function PIPE_appendToCache(p){
  var items=p&&p.items||[]; var updated=[];
  for(var i=0;i<items.length;i++){
    var r=CACHE_updateStatus({cache_id:items[i].cache_id, published:!!items[i].published, published_url:items[i].published_url||''});
    updated.push({cache_id:items[i].cache_id, ok:r.ok});
  }
  return {ok:true, updated:updated};
}
function PIPE_updateCalendarSheet(p){
  var calSh=Helpers_getOrCreateSheet_('calendar');
  var vals=calSh.getDataRange().getValues(); if(vals.length<2) return {ok:false,msg:'empty calendar'};
  var idx=Helpers_index_(vals[0]); var items=p&&p.items||[];
  for(var i=0;i<items.length;i++){
    for(var r=1;r<vals.length;r++){
      if(String(vals[r][idx.topic])===String(items[i].topic)){
        calSh.getRange(r+0, idx.status+1).setValue(items[i].status||'published');
        if(items[i].published_url) calSh.getRange(r+0, idx.published_url+1).setValue(items[i].published_url);
        break;
      }
    }
  }
  return {ok:true};
}
