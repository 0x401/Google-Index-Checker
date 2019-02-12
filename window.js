let baseUrl = "https://www.google.com/search?q=site:";
let index = -1;
let id;
let list;
let error = false;
let count = 0;
let total = 0;
let indexed = 0;
let unIndexed = 0;
let stop = true;
//import url file
function importTxt() {
	chrome.fileSystem.chooseEntry({
		type: 'openFile',
		accepts: [{ extensions: ['txt'] }]
	},
		function (fileEntry) {
			if (!fileEntry) { return; }
			fileEntry.file(function (file) {
				var reader = new FileReader();
				reader.onload = function (e) {
					let list = e.target.result.split("\n");
					$("#list>tbody").empty();
					$.each(list, function (i, value) {
						if (value.trim() != "") {
							$("#list>tbody").append('<tr id="_' + i + '"><td>' + i + '</td><td class="url">' + value + '</td><td class="status"></td><!--<td class="page"></td>--></tr>');
							total++;
						}
					});
					//$("#list").text ();
					$("#total").text(total);
				};
				reader.readAsText(file);
			});
		});
}
function exportTxt() {
	let list = $("#list>tbody>tr");
	let r = ["URL,Indexed\n"];
	for (var i = 0; i < list.length; i++) {
		if (list.children("td.status")[i].innerText != "") {
			r[i + 1] = list.children("td.url")[i].innerText + "," + list.children("td.status")[i].innerText + "\n";
		}
	}
	function errorHandler() {
		console.log('a');
	}
	chrome.fileSystem.chooseEntry({ type: 'saveFile', suggestedName: 'a.csv' }, function (writableFileEntry) {
		writableFileEntry.createWriter(function (writer) {
			writer.onerror = errorHandler;
			writer.onwriteend = function (e) {
				console.log('write complete');
			};
			writer.write(new Blob(r, { type: 'text/plain' }));
		}, errorHandler);
	});

}
function updateLocation() {
	$.getJSON('http://ip-api.com/json/', function (data) {
		switch (data.query) {
			case "45.79.90.199": $("#location").text("US1"); break;
			case "45.76.71.238": $("#location").text("US2"); break;
			case "176.58.101.66": $("#location").text("UK"); break;
			case "103.3.61.241": $("#location").text("SG1"); break;
			case "45.76.148.139": $("#location").text("SG1"); break;
			case "139.162.78.149": $("#location").text("JP1"); break;
			case "104.156.239.42": $("#location").text("JP2"); break;
			case "45.76.113.73": $("#location").text("AU1"); break;
			case "45.63.114.37": $("#location").text("FR1"); break;
			case "45.32.151.97": $("#location").text("FR2"); break;
			case "101.207.120.16": $("#location").text("联通"); break;

			default: $("#location").text(data.countryCode);
		}
	});
}
updateLocation();
$("body").on('click', '#import', importTxt);
$("body").on('click', '#export', exportTxt);
$("body").on('loadstart', "#foo", function () {
	//	$("#foo").hide();
	//$("#tip").text(document.getElementById("foo").getUserAgent());
	if (index != -1) {
		$("#tip").text(id);
		$("#" + id).children(".status").removeClass().addClass("status is-loading is-success has-text-centered").text("Testing");

	}
});
$("body").on('loadredirect', "#foo", function () {
	$("#tip").text("re:" + id);
});
$("body").on('loadabort', "#foo", function (reason) {
	error = true;
	//	return;
	//$("#tip").text(reason+":" + id);
});
$("body").on('loadstop', "#foo", function () {
	if (error) {
		$("#foo").show();
		error = false;
		return;
	}
	let href = $("#foo").attr("src");
	//$("#res").text("OK");

	if (index != -1 && href.match("sorry") == null) {
		$('html, body').animate({
			scrollTop: $("#" + id).offset().top - 65
		}, 300);


		document.getElementById("foo").find("did not match any documents", function (results) {

			//$("#"+id).children(".page").text($("#foo").attr("src"));
			if (results.numberOfMatches == 0) {
				$("#" + id).children(".status").removeClass().addClass("status is-success has-text-centered yes").text("YES");
				indexed++;
				//$("#indexed").text(indexed);
				$("#indexed").text($(".yes").length);
			} else {
				$("#" + id).children(".status").removeClass().addClass("status is-danger has-text-centered no").text("NO");
				unIndexed++;
				//$("#unIndexed").text(unIndexed);
				$("#unIndexed").text($(".no").length);
			}

			if (index < list.length) {
				if (stop == false) {
					index++;
					id = list[index].id;
					$("#foo").attr("src", baseUrl + $("#" + id).children(".url").text());
				}
			} else {
				index = -1;
				list = null;
				stop = true;
				$("#stop").prop({ "id": "check", "value": "Check" });
			}

		});
	} else if (href.match("sorry") != null) {
		$("#foo").show();
		$("#tip").text("e:" + id);
		$("#" + id).children(".status").removeClass().addClass("status is-warning has-text-centered").text("ERROR");
		chrome.notifications.create("error", { type: "basic", iconUrl: 'icon.jpg', title: "Error", message: "验证码" }, function () { });
		return;
	}

});
// $("body").on("click",function(){
// 	chrome.notifications.create("error",  {type:"basic",iconUrl: 'icon.jpg',title:"Error",message:"验证码"}, function (){});
// });
$("body").on('click', '#stop', function () {
	stop = true;
	$("#stop").prop({ "id": "check", "value": "Check" });
});

$("body").on('click', '#check', function () {
	//updateLocation();
	baseUrl="https://www.google.com/search?q=site:"
	baseUrl += $("#baseUrl").val();
	if (index == -1) {
		list = $("#list>tbody>tr");
		//	index = 0;
	}
	if (list.length != 0) {
		if (index == -1) { index = 0; }

		stop = false;
		id = list[index].id;
		$("#check").prop({ "id": "stop", "value": "Stop" });

		$("#foo").attr("src", baseUrl + $("#" + id).children(".url").text());

	}

});