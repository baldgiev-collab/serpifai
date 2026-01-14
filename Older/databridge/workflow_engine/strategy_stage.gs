function WF_strategyStage(p){
  var pr=PM_loadProject({project_id:(p&&p.project_id)||'active'}), i=pr.inputs||{};
  var narrativeAxis=['Price','Speed','Quality','Trust','Innovation','Community','Locality'];
  var categoryGaps=['Under-served long-tail pains','Outdated incumbents','High-intent SERPs lacking EEAT','AEO Q&A voids'];
  return {ok:true, brand_archetype:i.brand_archetype||'Sage/Hero', differentiation_axes:narrativeAxis, category_gaps:categoryGaps,
          recommendation:'Own "'+(i.pillar_topics||'core pillars')+'" with authority-led guides + fast refresh cycles.'};
}
