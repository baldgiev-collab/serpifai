function BULK_router(p){
  if(p&&p.action==='generate') return BULK_batchGenerator(p);
  if(p&&p.action==='publish')  return BULK_batchPublisher(p);
  return {ok:false,msg:'Unknown bulk action'};
}
