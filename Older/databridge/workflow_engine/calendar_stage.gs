function WF_calendarStage(p){
  var pr=PM_loadProject({project_id:(p&&p.project_id)||'active'}); var s=pr.strategy||{};
  var start=new Date(); var days=(String(s.horizon||p&&p.horizon||'1m')==='1y'?365:String(s.horizon||p&&p.horizon||'1m')==='3m'?90:String(s.horizon||p&&p.horizon||'1m')==='4m'?120:String(s.horizon||p&&p.horizon||'1m')==='1w'?7:30);
  var perWeek=Math.max(1, parseInt(String(s.frequency||p&&p.frequency||'5'),10)); var cadence=Math.max(1, Math.floor(7/perWeek));
  var parents=s.parents||['Blog Post']; var subs=s.subs||['How-to']; var platforms=['blog','linkedin','youtube','email','twitter','instagram','tiktok'];
  var rows=[]; for(var i=0;i<days;i+=cadence){ var d=new Date(start.getTime()+i*86400000);
    rows.push({date:Utilities.formatDate(d,Session.getScriptTimeZone(),'yyyy-MM-dd'), platform:platforms[i%platforms.length], format:parents[i%parents.length], subtype:subs[i%subs.length], topic:'Momentum topic '+(i+1)});
  }
  return {ok:true, cadence_days:cadence, rows:rows};
}
