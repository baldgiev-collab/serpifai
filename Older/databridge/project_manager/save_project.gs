function PM_saveProject(p){
  p=p||{}; var id=p.project_id||'active';
  var sh=Helpers_getOrCreateSheet_('project_settings');
  var header=Helpers_ensureHeader_(sh,['project_id','name','domain','language','input_fields_json','strategy_json','fingerprint_json','created_at','updated_at']);
  var idx=Helpers_index_(header); var fr=Helpers_findRow_(sh,'project_id',id); var now=new Date();
  if(fr.index<0){
    var row=new Array(header.length).fill('');
    row[idx.project_id]=id; row[idx.name]=p.name||''; row[idx.domain]=p.domain||''; row[idx.language]=p.language||'';
    row[idx.input_fields_json]=JSON.stringify(p.inputs||{}); row[idx.strategy_json]=JSON.stringify(p.strategy||{});
    row[idx.fingerprint_json]=JSON.stringify(p.fingerprint||{}); row[idx.created_at]=now; row[idx.updated_at]=now; sh.appendRow(row);
  }else{
    var r=fr.rowNum, i=fr.idx;
    if(p.name!=null)       sh.getRange(r,i.name+1).setValue(p.name);
    if(p.domain!=null)     sh.getRange(r,i.domain+1).setValue(p.domain);
    if(p.language!=null)   sh.getRange(r,i.language+1).setValue(p.language);
    if(p.inputs!=null)     sh.getRange(r,i.input_fields_json+1).setValue(JSON.stringify(p.inputs));
    if(p.strategy!=null)   sh.getRange(r,i.strategy_json+1).setValue(JSON.stringify(p.strategy));
    if(p.fingerprint!=null)sh.getRange(r,i.fingerprint_json+1).setValue(JSON.stringify(p.fingerprint));
    sh.getRange(r,i.updated_at+1).setValue(now);
  }
  return {ok:true, project_id:id};
}
