var regex = new RegExp('\\/\\*\\n'+
'\\s*\\*\\s+Copyright\\s+\\(c\\)\\s+(\\d{4})\\s+DataTorrent,\\s+Inc\\.\\s+ALL\\s+Rights\\s+Reserved\\.\\n'+
'\\s*\\*\\n'+
'\\s*\\*\\s+Licensed\\s+under\\s+the\\s+Apache\\s+License,\\s+Version\\s+2\\.0\\s+\\(the\\s+"License"\\);\\n'+
'\\s*\\*\\s+you\\s+may\\s+not\\s+use\\s+this\\s+file\\s+except\\s+in\\s+compliance\\s+with\\s+the\\s+License\\.\\n'+
'\\s*\\*\\s+You\\s+may\\s+obtain\\s+a\\s+copy\\s+of\\s+the\\s+License\\s+at\\n'+
'\\s*\\*\\n'+
'\\s*\\*\\s+http://www\\.apache\\.org/licenses/LICENSE\\-2\\.0\\n'+
'\\s*\\*\\n'+
'\\s*\\*\\s+Unless\\s+required\\s+by\\s+applicable\\s+law\\s+or\\s+agreed\\s+to\\s+in\\s+writing,\\s+software\\n'+
'\\s*\\*\\s+distributed\\s+under\\s+the\\s+License\\s+is\\s+distributed\\s+on\\s+an\\s+"AS\\s+IS"\\s+BASIS,\\n'+
'\\s*\\*\\s+WITHOUT\\s+WARRANTIES\\s+OR\\s+CONDITIONS\\s+OF\\s+ANY\\s+KIND,\\s+either\\s+express\\s+or\\s+implied\\.\\n'+
'\\s*\\*\\s+See\\s+the\\s+License\\s+for\\s+the\\s+specific\\s+language\\s+governing\\s+permissions\\s+and\\n'+
'\\s*\\*\\s+limitations\\s+under\\s+the\\s+License\\.\\n'+
'\\s*\\*/' + 
'\\n*');
exports = module.exports = regex;