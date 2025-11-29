function WF_contentGenerationStage(p){
  var pr=PM_loadProject({project_id:(p&&p.project_id)||'active'});
  var rows=(p&&p.rows)||(WF_calendarStage(p).rows||[]); var out=[];
  rows.forEach(function(r){
    var prompt=AI_buildPrompt({project:pr, inputs:pr.inputs, platform:r.platform, format:r.format, subtype:r.subtype, topic:r.topic});
    var first=AI_geminiGenerate((pr.inputs&&pr.inputs.llm_model)||'gemini-2.0-flash',prompt,{maxTokens:1536,temperature:0.65});
    var critique='Critique and improve body to meet rubric — return improved body only.\n'+String(first.text||'');
    var improved=AI_geminiGenerate((pr.inputs&&pr.inputs.llm_model)||'gemini-2.0-flash',critique,{maxTokens:1536,temperature:0.4});
    out.push({date:r.date, platform:r.platform, title:r.topic, body:improved.text||first.text||''});
  });
  return {ok:true, items:out};
}
