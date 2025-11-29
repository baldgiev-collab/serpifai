function PM_createProject(p){
  p=p||{}; var id=p.project_id||Utilities.getUuid();
  var sh=Helpers_getOrCreateSheet_('project_settings');
  var header=Helpers_ensureHeader_(sh,['project_id','name','domain','language','input_fields_json','strategy_json','fingerprint_json','created_at','updated_at']);
  var idx=Helpers_index_(header); var now=new Date();
  var row=new Array(header.length).fill('');
  row[idx.project_id]=id; row[idx.name]=p.name||''; row[idx.domain]=p.domain||''; row[idx.language]=p.language||'';
  row[idx.input_fields_json]=JSON.stringify(p.inputs||{}); row[idx.strategy_json]=JSON.stringify(p.strategy||{});
  row[idx.fingerprint_json]=JSON.stringify({archetype:(p.inputs&&p.inputs.brand_archetype)||'', usp:(p.inputs&&p.inputs.usp)||''});
  row[idx.created_at]=now; row[idx.updated_at]=now; sh.appendRow(row);
  return {ok:true, project_id:id};
}
