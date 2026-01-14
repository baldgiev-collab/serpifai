function PM_deleteProject(p){
  p=p||{}; var id=p.project_id||'active';
  var sh=SpreadsheetApp.getActive().getSheetByName('project_settings'); if(!sh) return {ok:false,msg:'No sheet'};
  var fr=Helpers_findRow_(sh,'project_id',id); if(fr.index<0) return {ok:false,msg:'Not found'};
  sh.deleteRow(fr.rowNum); return {ok:true};
}
