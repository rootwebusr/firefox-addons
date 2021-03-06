
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}
function doSearch(str)
{
	/*Search in ALL search engines*/
	/* First in Native Search Engines */
	//Firefox Native Search Engines
	var divfind=new Array;
	
	getSearchEngines(function(se){
		
		if(se!="NULL")
		{
			console.log(se);
			
			for(var key in se.directories)
			{
				var engines=se.directories[key].engines;
				for(var i=0;i<engines.length;i++)
				{
					//For every search engine
					var eng=engines[i];
					var name=eng._name;
					var favicon=eng._iconURL;
					var description=eng.description;
					var url="";
					var count=eng._urls.length-1;
					if(eng._urls[count].template.contains("{searchTerms}"))
					{
						url+=eng._urls[count].template.split("{searchTerms}")[0];
						url+=str;

					}else{
						url=eng._urls[count].template+"?utm_source=DivFind";
						for(var l=0;l<eng._urls[count].params.length;l++)
						{
							var value=eng._urls[count].params[l].value;
							if(value=="{searchTerms}")
							{
								value=str;
							}
							url+="&"+eng._urls[count].params[l].name+"="+value;
						}
					}
					var find={
						"name" : name,
						"favicon" : favicon,
						"description" : description,
						"url" : url
					};
					divfind.push(find);
				}
			}
		}
		
	});
	/* IndexedDB Search Engines*/
	try{
	var request=indexedDB.open("SearchEngines",2);
	request.onerror=function(){
		console.log("Error opening the database");
	}
	request.onupgradeneeded=function(evt){
		var db=evt.target.result;
                if(!db.objectStoreNames.contains("search-engine"))
		{
                        var object=db.createObjectStore("search-engine",{keyPath: "id",autoIncrement: true});
		}

	}
	request.onsuccess=function(evt)
	{
                var db=evt.target.result;
                var objectStore = db.transaction("search-engine").objectStore("search-engine");
		objectStore.openCursor().onsuccess=function(event)
		{
			var cursor = event.target.result;
			if (cursor) {
				console.log(cursor);
				var find=cursor.value;
				find.url=find.url.split("{searchTerms}")[0]+str;
				divfind.push(find);
				cursor.continue();
	
			}else
			{
				createUI(divfind);


			}
		}
	}
	}catch(e)
	{
		createUI(divfind);
	}



	
}
function createUI(divfind)
{
	/* Create UI */
				var article=document.getElementById("main");
				for(var f=0;f<divfind.length;f++)
				{
					var section=document.createElement("section");
					var h3=document.createElement("h3");
					h3.textContent=divfind[f].name;
					var p=document.createElement("p");
					p.textContent=divfind[f].description;
					var a=document.createElement("a");
					a.href=divfind[f].url;
					a.target="_blank";
					a.textContent="Open in a new tab";
					p.appendChild(a);
					var favicon=new Image();
					favicon.src=divfind[f].favicon;
					var iframe=document.createElement("iframe");
					iframe.sandbox=true;
					iframe.src=divfind[f].url;
		
					section.appendChild(h3);
					section.appendChild(favicon);
					section.appendChild(p);
					section.appendChild(iframe);
					article.appendChild(section);
				}
				if(0==divfind.length)
				{
					var section=document.createElement("h2");
					var a=document.createElement("a");
					a.textContent="You don't have any search engine. Go here and configure one.";
					a.href="javascript:window.location='add.html?SEARCH=NULL&JSON=NULL'";
					section.appendChild(a);
					article.appendChild(section);
				}
}
function doManage(JSON)
{

	window.location="manage.html?JSON="+JSON;
}
function getSearchEngines(callback)
{
	try{
		var jsonstr=atob(getUrlVars()["JSON"]);
		if(jsonstr=="" || jsonstr=="NULL" || jsonstr==undefined)
		{
			callback("NULL");
		}else{
			try{
				var search_engines=JSON.parse(jsonstr);
				//return search_engines;
				callback(search_engines);
			}catch(e){
				callback("NULL");		
			}
		}
	}catch(e)
	{
		callback("NULL");
	}
	
}
window.addEventListener("DOMContentLoaded",function(){
	var searchbutton=document.getElementById("search");
	searchbutton.addEventListener("click",function(){
		doSearch(document.getElementById("searchbox").value);
	});
	var search_init=getUrlVars()["SEARCH"];
	if(search_init!=undefined && search_init!="NULL")
	{
		document.getElementById("searchbox").value=search_init;
		doSearch(search_init);
	}
	var managebutton=document.getElementById("manage");
	managebutton.addEventListener("click",function(){
		doManage(getUrlVars()["JSON"]);
	});
	try{
		navigator.registerProtocolHandler("web+divfind",window.location.href.split("?")[0]+"?SEARCH=%s&JSON=NULL","DivFind");
	}catch(e)
	{

	}


});
