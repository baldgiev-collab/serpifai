function BL_openPageRankFetch(p){return APIS_openPageRankFetch(p&&p.domain?p.domain:(PM_loadProject({project_id:'active'}).domain||'example.com'));}
