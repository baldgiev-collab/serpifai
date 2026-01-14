function PE_decayDetection(p){var g=PE_searchConsoleFetch(p);return {ok:true,decay:(g.ctr||0)<0.015,reason:(g.ctr||0)<0.015?'CTR below 1.5%':'Healthy'};}
