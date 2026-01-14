function QA_readability(text){text=String(text||'');var wc=text.split(/\s+/).length;var para=(text.match(/\n\n/g)||[]).length;return Math.min(100,58+(wc>900?12:0)+(wc>1500?8:0)+(para>6?6:0));}
