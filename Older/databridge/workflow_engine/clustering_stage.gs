function WF_clusteringStage(p){
  var kw=(p&&p.keywords)||[]; if(!kw.length){ var k=WF_keywordStage(p); kw=[].concat(k.seeds||[],k.aeo||[],k.local||[],k.suggestions||[]); }
  var buckets={}; kw.forEach(function(k){ var key=(String(k).split(' ')[0]||'misc').toLowerCase(); (buckets[key]||(buckets[key]=[])).push(k); });
  var links=Object.keys(buckets).map(function(b){return {pillar:b, clusters:buckets[b].slice(0,6)};});
  return {ok:true, pillars:Object.keys(buckets), clusters:buckets, linking_blueprint:links};
}
