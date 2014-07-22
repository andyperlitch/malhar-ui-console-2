/*
* Copyright (c) 2013 DataTorrent, Inc. ALL Rights Reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
'use strict';

var regex = new RegExp('\\/\\*\\n'+
'\\s*\\*\\s+Copyright\\s+\\(c\\)\\s+(\\d{4})\\s+DataTorrent,\\s+Inc\\.\\s+ALL\\s+Rights\\s+Reserved\\.\\s*\\n'+
'\\s*\\*\\s*\\n'+
'\\s*\\*\\s+Licensed\\s+under\\s+the\\s+Apache\\s+License,\\s+Version\\s+2\\.0\\s+\\(the\\s+"License"\\);\\s*\\n'+
'\\s*\\*\\s+you\\s+may\\s+not\\s+use\\s+this\\s+file\\s+except\\s+in\\s+compliance\\s+with\\s+the\\s+License\\.\\s*\\n'+
'\\s*\\*\\s+You\\s+may\\s+obtain\\s+a\\s+copy\\s+of\\s+the\\s+License\\s+at\\s*\\n'+
'\\s*\\*\\s*\\n'+
'\\s*\\*\\s+http://www\\.apache\\.org/licenses/LICENSE\\-2\\.0\\s*\\n'+
'\\s*\\*\\s*\\n'+
'\\s*\\*\\s+Unless\\s+required\\s+by\\s+applicable\\s+law\\s+or\\s+agreed\\s+to\\s+in\\s+writing,\\s+software\\s*\\n'+
'\\s*\\*\\s+distributed\\s+under\\s+the\\s+License\\s+is\\s+distributed\\s+on\\s+an\\s+"AS\\s+IS"\\s+BASIS,\\s*\\n'+
'\\s*\\*\\s+WITHOUT\\s+WARRANTIES\\s+OR\\s+CONDITIONS\\s+OF\\s+ANY\\s+KIND,\\s+either\\s+express\\s+or\\s+implied\\.\\s*\\n'+
'\\s*\\*\\s+See\\s+the\\s+License\\s+for\\s+the\\s+specific\\s+language\\s+governing\\s+permissions\\s+and\\s*\\n'+
'\\s*\\*\\s+limitations\\s+under\\s+the\\s+License\\.\\s*\\n'+
'\\s*\\*/' + 
'\\s*\\n*');
exports = module.exports = regex;