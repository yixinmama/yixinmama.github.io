!function(a){function b(b,d,e){var f=this;return this.on("click.pjax",b,function(b){var g=a.extend({},p(d,e));g.container||(g.container=a(this).attr("data-pjax")||f),c(b,g)})}function c(b,c,d){var f,g,h,i;if(d=p(c,d),f=b.currentTarget,"A"!==f.tagName.toUpperCase())throw"$.fn.pjax or $.pjax.click requires an anchor element";b.which>1||b.metaKey||b.ctrlKey||b.shiftKey||b.altKey||location.protocol===f.protocol&&location.hostname===f.hostname&&(f.hash&&f.href.replace(f.hash,"")===location.href.replace(location.hash,"")||f.href!==location.href+"#"&&(b.isDefaultPrevented()||(g={url:f.href,container:a(f).attr("data-pjax"),target:f},h=a.extend({},g,d),i=a.Event("pjax:click"),a(f).trigger(i,[h]),i.isDefaultPrevented()||(e(h),b.preventDefault(),a(f).trigger("pjax:clicked",[h])))))}function d(b,c,d){var f,g;if(d=p(c,d),f=b.currentTarget,"FORM"!==f.tagName.toUpperCase())throw"$.pjax.submit requires a form element";g={type:f.method.toUpperCase(),url:f.action,data:a(f).serializeArray(),container:a(f).attr("data-pjax"),target:f},e(a.extend({},g,d)),b.preventDefault()}function e(b){function h(b,d,e){e||(e={}),e.relatedTarget=c;var g=a.Event(b,e);return f.trigger(g,d),!g.isDefaultPrevented()}var c,d,f,i,j;return b=a.extend(!0,{},a.ajaxSettings,e.defaults,b),a.isFunction(b.url)&&(b.url=b.url()),c=b.target,d=o(b.url).hash,f=b.context=q(b.container),b.data||(b.data={}),b.data._pjax=f.selector,b.beforeSend=function(a,c){return"GET"!==c.type&&(c.timeout=0),a.setRequestHeader("X-PJAX","true"),a.setRequestHeader("X-PJAX-Container",f.selector),h("pjax:beforeSend",[a,c])?(c.timeout>0&&(i=setTimeout(function(){h("pjax:timeout",[a,b])&&a.abort("timeout")},c.timeout),c.timeout=0),b.requestUrl=o(c.url).href,void 0):!1},b.complete=function(a,c){i&&clearTimeout(i),h("pjax:complete",[a,c,b]),h("pjax:end",[a,b])},b.error=function(a,c,d){var e=t("",a,b),f=h("pjax:error",[a,c,d,b]);"GET"==b.type&&"abort"!==c&&f&&g(e.url)},b.success=function(c,i,j){var r,s,v,k=e.state,l="function"==typeof a.pjax.defaults.version?a.pjax.defaults.version():a.pjax.defaults.version,n=j.getResponseHeader("X-PJAX-Version"),p=t(c,j,b);if(l&&n&&l!==n)return g(p.url),void 0;if(!p.contents)return g(p.url),void 0;e.state={id:b.id||m(),url:p.url,title:p.title,container:f.selector,fragment:b.fragment,timeout:b.timeout},(b.push||b.replace)&&window.history.replaceState(e.state,p.title,p.url);try{document.activeElement.blur()}catch(q){}p.title&&(document.title=p.title),h("pjax:beforeReplace",[p.contents,b],{state:e.state,previousState:k}),f.html(p.contents),r=f.find("input[autofocus], textarea[autofocus]").last()[0],r&&document.activeElement!==r&&r.focus(),u(p.scripts),"number"==typeof b.scrollTo&&a(window).scrollTop(b.scrollTo),""!==d&&(s=o(p.url),s.hash=d,e.state.url=s.href,window.history.replaceState(e.state,p.title,s.href),v=a(s.hash),v.length&&a(window).scrollTop(v.offset().top)),h("pjax:success",[c,i,j,b])},e.state||(e.state={id:m(),url:window.location.href,title:document.title,container:f.selector,fragment:b.fragment,timeout:b.timeout},window.history.replaceState(e.state,document.title)),j=e.xhr,j&&j.readyState<4&&(j.onreadystatechange=a.noop,j.abort()),e.options=b,j=e.xhr=a.ajax(b),j.readyState>0&&(b.push&&!b.replace&&(y(e.state.id,f.clone().contents()),window.history.pushState(null,"",n(b.requestUrl))),h("pjax:start",[j,b]),h("pjax:send",[j,b])),e.xhr}function f(b,c){var d={url:window.location.href,push:!1,replace:!0,scrollTo:!1};return e(a.extend(d,p(b,c)))}function g(a){window.history.replaceState(null,"","#"),window.location.replace(a)}function k(b){var f,j,k,l,m,n,c=e.state,d=b.state;if(d&&d.container){if(h&&i==d.url)return;if(e.state&&e.state.id===d.id)return;f=a(d.container),f.length?(k=v[d.id],e.state&&(j=e.state.id<d.id?"forward":"back",z(j,e.state.id,f.clone().contents())),l=a.Event("pjax:popstate",{state:d,direction:j}),f.trigger(l),m={id:d.id,url:d.url,container:f,push:!1,fragment:d.fragment,timeout:d.timeout,scrollTo:!1},k?(f.trigger("pjax:start",[null,m]),e.state=d,d.title&&(document.title=d.title),n=a.Event("pjax:beforeReplace",{state:d,previousState:c}),f.trigger(n,[k,m]),f.html(k),f.trigger("pjax:end",[null,m])):e(m),f[0].offsetHeight):g(location.href)}h=!1}function l(b){var f,c=a.isFunction(b.url)?b.url():b.url,d=b.type?b.type.toUpperCase():"GET",e=a("<form>",{method:"GET"===d?"GET":"POST",action:c,style:"display:none"});if("GET"!==d&&"POST"!==d&&e.append(a("<input>",{type:"hidden",name:"_method",value:d.toLowerCase()})),f=b.data,"string"==typeof f)a.each(f.split("&"),function(b,c){var d=c.split("=");e.append(a("<input>",{type:"hidden",name:d[0],value:d[1]}))});else if("object"==typeof f)for(key in f)e.append(a("<input>",{type:"hidden",name:key,value:f[key]}));a(document.body).append(e),e.submit()}function m(){return(new Date).getTime()}function n(a){return a.replace(/\?_pjax=[^&]+&?/,"?").replace(/_pjax=[^&]+&?/,"").replace(/[\?&]$/,"")}function o(a){var b=document.createElement("a");return b.href=a,b}function p(b,c){return b&&c?c.container=b:c=a.isPlainObject(b)?b:{container:b},c.container&&(c.container=q(c.container)),c}function q(b){if(b=a(b),b.length){if(""!==b.selector&&b.context===document)return b;if(b.attr("id"))return a("#"+b.attr("id"));throw"cant get selector for pjax container!"}throw"no pjax container for "+b.selector}function r(a,b){return a.filter(b).add(a.find(b))}function s(b){return a.parseHTML(b,document,!0)}function t(b,c,d){var f,g,h,e={};return e.url=n(c.getResponseHeader("X-PJAX-URL")||d.requestUrl),/<html/i.test(b)?(f=a(s(b.match(/<head[^>]*>([\s\S.]*)<\/head>/i)[0])),g=a(s(b.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0]))):f=g=a(s(b)),0===g.length?e:(e.title=r(f,"title").last().text(),d.fragment?(h="body"===d.fragment?g:r(g,d.fragment).first(),h.length&&(e.contents=h.contents(),e.title||(e.title=h.attr("title")||h.data("title")))):/<html/i.test(b)||(e.contents=g),e.contents&&(e.contents=e.contents.not(function(){return a(this).is("title")}),e.contents.find("title").remove(),e.scripts=r(e.contents,"script[src]").remove(),e.contents=e.contents.not(e.scripts)),e.title&&(e.title=a.trim(e.title)),e)}function u(b){if(b){var c=a("script[src]");b.each(function(){var e,b=this.src,d=c.filter(function(){return this.src===b});d.length||(e=document.createElement("script"),e.type=a(this).attr("type"),e.src=a(this).attr("src"),document.head.appendChild(e))})}}function y(a,b){for(v[a]=b,x.push(a);w.length;)delete v[w.shift()];for(;x.length>e.defaults.maxCacheLength;)delete v[x.shift()]}function z(a,b,c){var d,e;v[b]=c,"forward"===a?(d=x,e=w):(d=w,e=x),d.push(b),(b=e.pop())&&delete v[b]}function A(){return a("meta").filter(function(){var b=a(this).attr("http-equiv");return b&&"X-PJAX-VERSION"===b.toUpperCase()}).attr("content")}function B(){a.fn.pjax=b,a.pjax=e,a.pjax.enable=a.noop,a.pjax.disable=C,a.pjax.click=c,a.pjax.submit=d,a.pjax.reload=f,a.pjax.defaults={timeout:650,push:!0,replace:!1,type:"GET",dataType:"html",scrollTo:0,maxCacheLength:20,version:A},a(window).on("popstate.pjax",k)}function C(){a.fn.pjax=function(){return this},a.pjax=l,a.pjax.enable=B,a.pjax.disable=a.noop,a.pjax.click=a.noop,a.pjax.submit=a.noop,a.pjax.reload=function(){window.location.reload()},a(window).off("popstate.pjax",k)}var v,w,x,h=!0,i=window.location.href,j=window.history.state;j&&j.container&&(e.state=j),"state"in window.history&&(h=!1),v={},w=[],x=[],a.inArray("state",a.event.props)<0&&a.event.props.push("state"),a.support.pjax=window.history&&window.history.pushState&&window.history.replaceState&&!navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]|WebApps\/.+CFNetwork)/),a.support.pjax?B():C()}(jQuery);