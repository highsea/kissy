KISSY.add("note/mods/NoteView",function(e,d,a,h){function c(){c.superclass.constructor.apply(this,arguments);this.get("note").on("*Change",this.render,this);this.get("note").on("destroy",this.destroy,this)}var i=new h(d.all("#noteTpl").html());e.extend(c,a.View,{render:function(){this.get("el").addClass("note").attr("id",this.get("note").getId());this.get("el").html(i.render({note:this.get("note").toJSON()}));return this},destroy:function(){this.get("el").remove()}});return c},{requires:["node","mvc",
"xtemplate"]});
KISSY.add("note/mods/NotesView",function(e,d,a,h,c){function i(){i.superclass.constructor.apply(this,arguments);var b=this,f,a,e=b.get("el");b.searchInput=e.one(".searchInput");a=b.dataList=e.one(".dataList");f=b.statistic=e.one(".statistic");var d=b.get("notes");d.on("*Change",function(a){a.target!=b&&f.html(a.target.get("title"))});d.on("add remove",function(a){f.html(a.model.get("title"))});d.on("add",function(b){a.append((new c({note:b.model})).render().get("el"))});d.on("afterModelsChange",function(){a.html(g.render({list:d.toJSON()}));
a.all(".note").each(function(a,b){new c({note:d.at(b),el:a})})})}var f=d.all,g=new h(f("#listTpl").html());e.extend(i,a.View,{newNote:function(){a.Router.navigate("/new/")},refreshNote:function(){this.get("notes").load()},editNote:function(b){a.Router.navigate("/edit/"+f(b.currentTarget).parent("div").attr("id"))},deleteNode:function(a){this.get("notes").getById(f(a.currentTarget).parent("div").attr("id")).destroy({"delete":1})},search:function(){e.trim(this.searchInput.val())&&a.Router.navigate("/search/?q="+
encodeURIComponent(this.searchInput.val()))},keyup:function(a){13==a.keyCode&&(a.halt(),this.searchInput[0].focus(),this.search())}},{ATTRS:{el:{value:"#list"},events:{value:{".edit":{click:"editNote"},".newNote":{click:"newNote"},".delete":{click:"deleteNode"},".refreshNote":{click:"refreshNote"},".searchNote":{click:"search"},".searchInput":{keyup:"keyup"}}}}});return i},{requires:["node","mvc","xtemplate","./NoteView"]});
KISSY.add("note/mods/EditView",function(e,d,a,h){function c(){c.superclass.constructor.apply(this,arguments)}var i=new h(d.all("#detailTpl").html());e.extend(c,a.View,{submit:function(){var a=this.get("note"),c=this.get("el");a.set({title:c.one(".title").val(),content:c.one(".content").val()});this.fire("submit",{note:a})},render:function(){this.get("el").html(i.render({note:this.get("note").toJSON()}));return this}},{ATTRS:{el:{value:"#edit"},events:{value:{".submit":{click:"submit"}}}}});return c},
{requires:["node","mvc","xtemplate"]});KISSY.add("note/mods/NoteModel",function(e,d){function a(){a.superclass.constructor.apply(this,arguments)}e.extend(a,d.Model);return a},{requires:["mvc"]});KISSY.add("note/mods/NotesCollection",function(e,d,a){function h(){h.superclass.constructor.apply(this,arguments)}e.extend(h,d.Collection,{ATTRS:{model:{value:a}}});return h},{requires:["mvc","./NoteModel"]});
KISSY.add("note/mods/SearchView",function(e,d,a,h){function c(){var a=this;c.superclass.constructor.apply(this,arguments);this.searchInput=this.get("el").one(".searchInput");this.searchList=this.get("el").one(".searchList");this.get("notes").on("afterModelsChange",function(){a.searchList.html(i.render({list:a.get("notes").toJSON()}))})}var d=d.all,i=new h(d("#searchTpl").html());e.extend(c,a.View,{search:function(){e.trim(this.searchInput.val())&&a.Router.navigate("/search/?q="+encodeURIComponent(this.searchInput.val()))},
keyup:function(a){13==a.keyCode&&(a.halt(),this.searchInput[0].focus(),this.search())},back:function(){this.searchInput.val("");a.Router.navigate("/")}},{ATTRS:{el:{value:"#search"},events:{value:{".searchBtn":{click:"search"},".backBtn":{click:"back"},".searchInput":{keyup:"keyup"}}}}});return c},{requires:["node","mvc","xtemplate"]});
KISSY.add("note/mods/router",function(e,d,a,h,c,i,f,g){function b(){b.superclass.constructor.apply(this,arguments);this.notesView=new h({notes:new i});this.editView=new c;this.notesView.get("notes").load();this.editView.on("submit",this._onEditSubmit,this);this.searchView=new g({notes:new i})}var j=e.Node.all;e.extend(b,a.Router,{_onEditSubmit:function(b){var b=b.note,c=this.notesView.get("notes");b.isNew()?c.create(b,{success:function(){a.Router.navigate("")}}):(c=c.getById(b.getId()),c.set(b.toJSON()),
c.save({success:function(){a.Router.navigate("")}}))},index:function(){j(".page").hide();this.notesView.get("el").show()},editNote:function(a){var b=new f({id:a.id}),c=this.editView;b.load({success:function(){j(".page").hide();c.set("note",b);c.render();c.get("el").show()}})},newNote:function(){var a=this.editView;j(".page").hide();a.set("note",new f);a.render().get("el").show()},search:function(a,b){var c=e.urlDecode(b.q),d=this;d.searchView.searchInput.val(c);d.searchView.get("notes").load({data:{q:c},
success:function(){j(".page").hide();d.searchView.get("el").show()}})}},{ATTRS:{routes:{value:{"/":"index","":"index","/edit/:id":"editNote","/new/":"newNote","/search/":"search"}}}});return b},{requires:"node,mvc,./NotesView,./EditView,./NotesCollection,./NoteModel,./SearchView".split(",")});
KISSY.add("note/mods/sync",function(e,d){function a(a,d){for(var e=0;e<a.length;e++)if(a[e].id==d)return e;return-1}var h;return d.sync=function(c,i,f){f=f||{};e.log(i);setTimeout(function(){var g,b=h||(window.localStorage?window.localStorage.getItem("KISSY_Note")||[]:[]);"string"==typeof b&&(b=JSON.parse(b));var j,k;switch(i){case "read":var l;if(f.data&&(l=f.data.q))for(g in j=[],b)-1<b[g].title.indexOf(l)&&j.push(b[g]);else if(c instanceof d.Model)(j=b[a(b,c.get("id"))])||(k="not found");else for(g in j=
[],b)j.push(b[g]);break;case "create":j=c.toJSON();j.id=e.guid("note");j.time=(new Date).toLocaleTimeString();b.push(j);break;case "delete":g=c.get("id");g=a(b,g);-1<g&&b.splice(g,1);break;case "update":g=c.get("id"),g=a(b,g),-1<g&&(b[g]=c.toJSON())}"read"!=i&&window.localStorage&&window.localStorage.setItem("KISSY_Note",e.JSON.stringify(b));h=b;k?f.error&&f.error(null,k):f.success&&f.success(j);f.complete&&f.complete(j,k)},500)}},{requires:["mvc"]});
KISSY.add("note/main",function(e,d,a,h,c){new a;c.Router.start({success:function(){d.all("#loading").hide()}})},{requires:["node","./mods/router","./mods/sync","mvc"]});