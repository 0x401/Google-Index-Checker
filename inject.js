

let isIndex;
if(document.querySelector("#search")!=undefined){
	isIndex =(document.querySelector("#search").children.length==0)?false:true;
}
console.log(isIndex+":"+document.URL);
//did not match any documents
