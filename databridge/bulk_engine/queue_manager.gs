function BULK_queue(p){
  var sh=Helpers_getOrCreateSheet_('bulk_queue');
  var header=Helpers_ensureHeader_(sh,['id','action','payload','status','attempts','error','created_at','updated_at']);
  var idx=Helpers_index_(header); var id=Utilities.getUuid(); var now=new Date();
  var row=new Array(header.length).fill('');
  row[idx.id]=id; row[idx.action]=p.action||''; row[idx.payload]=JSON.stringify(p.payload||{});
  row[idx.status]='queued'; row[idx.attempts]=0; row[idx.error]=''; row[idx.created_at]=now; row[idx.updated_at]=now; sh.appendRow(row);
  return {ok:true, id:id};
}
