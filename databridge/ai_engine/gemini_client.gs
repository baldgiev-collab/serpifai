function AI_geminiGenerate(model, prompt, cfg){
  var key=PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if(!key) return {text:'[fallback draft]\n'+String(prompt||'').slice(0,400)};
  model=model||'gemini-2.0-flash'; cfg=cfg||{};
  var url='https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent?key='+encodeURIComponent(key);
  var body={contents:[{role:'user',parts:[{text:String(prompt||'')}]}],
            generationConfig:{temperature:Number(cfg.temperature||0.65),maxOutputTokens:Number(cfg.maxTokens||2048),topP:0.9,topK:40}};
  var res=UrlFetchApp.fetch(url,{method:'post',contentType:'application/json',payload:JSON.stringify(body),muteHttpExceptions:true});
  if(res.getResponseCode()>=200&&res.getResponseCode()<300){
    var data=JSON.parse(res.getContentText()||'{}');
    var text=(data.candidates&&data.candidates[0]&&data.candidates[0].content&&data.candidates[0].content.parts&&data.candidates[0].content.parts[0].text)||'';
    return {text:text||('[fallback draft]\n'+String(prompt||'').slice(0,400))};
  }
  return {text:'[api error '+res.getResponseCode()+'] '+String(prompt||'').slice(0,200)};
}
