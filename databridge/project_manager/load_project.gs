function PM_loadProject(p){
  p=p||{}; var id=p.project_id||'active';
  var sh=SpreadsheetApp.getActive().getSheetByName('project_settings'); if(!sh) return {};
  var row=Helpers_findRow_(sh,'project_id',id); if(row.index<0) return {};
  var i=row.idx, v=row.values;
  return { project_id:v[i.project_id], name:v[i.name], domain:v[i.domain], language:v[i.language],
           inputs:JSONX.parse(v[i.input_fields_json]||'{}',{}),
           strategy:JSONX.parse(v[i.strategy_json]||'{}',{}),
           fingerprint:JSONX.parse(v[i.fingerprint_json]||'{}',{}) };
}
