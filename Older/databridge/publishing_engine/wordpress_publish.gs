function PUB_wordpressPublish(p){
  var endpoint=PropertiesService.getScriptProperties().getProperty('WP_ENDPOINT');
  var token=PropertiesService.getScriptProperties().getProperty('WP_TOKEN');
  if(!endpoint||!token) return {ok:false,msg:'WP not configured'};
  var post=Object.assign({title:'Untitled',content:'',status:'draft'}, p||{});
  var res=UrlFetchApp.fetch(endpoint,{method:'post',contentType:'application/json',headers:{Authorization:'Bearer '+token},payload:JSON.stringify(post),muteHttpExceptions:true});
  return {ok:res.getResponseCode()<300,status:res.getResponseCode(),body:res.getContentText()};
}
