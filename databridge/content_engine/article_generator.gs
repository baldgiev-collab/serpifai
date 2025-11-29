function CE_articleGenerate(p){
  var pr=PM_loadProject({project_id:(p&&p.project_id)||'active'});
  var prompt=AI_buildPrompt({project:pr, inputs:pr.inputs, platform:p.platform||'blog', format:p.format||'Blog Post', subtype:p.subtype||'How-to', topic:p.topic||p.title||'Untitled'});
  var first=AI_geminiGenerate((pr.inputs&&pr.inputs.llm_model)||'gemini-2.0-flash',prompt,{maxTokens:1600,temperature:0.6});
  var improve='Rewrite crisp; add EEAT cues; add 2 internal anchors; keep JSON structure.\n'+String(first.text||'');
  var second=AI_geminiGenerate((pr.inputs&&pr.inputs.llm_model)||'gemini-2.0-flash',improve,{maxTokens:1600,temperature:0.45});
  return {title:p.title||p.topic||'Untitled', body:(second&&second.text)||first.text||''};
}
