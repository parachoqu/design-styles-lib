(function(){
  var E = '</scr'+'ipt>';
  function esc(v){ return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function patch(h, slug, o){
    if(o.css != null){
      var re = new RegExp('(<style data-css="'+slug+'">)[\\s\\S]*?(</style>)');
      if(!re.test(h)) throw new Error('css slice ausente: '+slug);
      h = h.replace(re, function(m,a,b){ return a+'\n'+o.css.trim()+'\n'+b; });
    }
    var tre = new RegExp('<template data-style="'+slug+'"([^>]*)>([\\s\\S]*?)</template>');
    var tm = h.match(tre);
    if(!tm) throw new Error('template ausente: '+slug);
    var at = tm[1];
    if(o.attrs) Object.keys(o.attrs).forEach(function(k){
      var are = new RegExp('\\sdata-'+k+'="[^"]*"');
      var rep = ' data-'+k+'="'+esc(o.attrs[k])+'"';
      at = are.test(at) ? at.replace(are, function(){ return rep; }) : at + rep;
    });
    var inner = o.html != null ? '\n'+o.html.trim()+'\n' : tm[2];
    var out = '<template data-style="'+slug+'"'+at+'>'+inner+'</template>';
    h = h.replace(tre, function(){ return out; });
    if(o.js != null){
      var open = '<script type="text/plain" data-js="'+slug+'">';
      var jre = new RegExp('(<script type="text/plain" data-js="'+slug+'">)[\\s\\S]*?(</scr'+'ipt>)');
      var body = open+'\n'+o.js.trim()+'\n'+E;
      if(jre.test(h)) h = h.replace(jre, function(){ return body; });
      else {
        var mk = '<script>\n(function(){\n\'use strict\';';
        var i = h.indexOf(mk);
        if(i < 0) throw new Error('marcador do script da app nao encontrado');
        h = h.slice(0,i) + body + '\n' + h.slice(i);
      }
    }
    if(o.ficha){
      var st = h.indexOf('<script type="application/json" id="dsl-fichas">');
      var s2 = h.indexOf('>', st) + 1, e2 = h.indexOf(E, s2);
      var json = JSON.parse(h.slice(s2, e2));
      if(!json[slug]) throw new Error('ficha ausente: '+slug);
      Object.keys(o.ficha).forEach(function(k){ json[slug][k] = o.ficha[k]; });
      h = h.slice(0, s2) + JSON.stringify(json) + h.slice(e2);
    }
    return h;
  }
  return { patch: patch, esc: esc };
})()