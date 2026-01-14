function WF_keywordStage(p){
  var pr=PM_loadProject({project_id:(p&&p.project_id)||'active'}), i=pr.inputs||{};
  var seeds=String(i.primary_keywords||'').split(/[;,\n]+/).map(function(s){return s.trim()}).filter(String);
  var aeo=seeds.map(function(k){return 'what is '+k;}).concat(seeds.map(function(k){return 'how to '+k;}));
  var local=(i.geo_focus?seeds.map(function(k){return k+' in '+i.geo_focus;}):[]);
  return {ok:true, seeds:seeds, aeo:aeo, local:local, suggestions:seeds.map(function(k){return 'best '+k+' tools';})};
}
