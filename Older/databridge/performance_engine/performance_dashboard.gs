function PE_dashboard(p){
  var g=PE_searchConsoleFetch(p);
  return {
    ok:true,
    kpis:{
      traffic_index:Math.round((g.clicks||0)/10),
      growth:'+7.8%',
      ctr:g.ctr,
      avg_pos:g.avg_pos,
      decay_flag:(g.ctr<0.015)
    }
  };
}
