$(function() {

	var count = 0;

	jsPlumb.bind("dblclick", function(conn, e) {
		var lab = prompt("Please enter subnet name");
		if (lab != null && lab != "") {
			conn.removeAllOverlays();
			conn.addOverlay([ "Label", { label: lab, cssClass: "labelSubnet" }]);
			conn.setPaintStyle(jsPlumb.Defaults.PaintStyle);
		} 
	});

	jsPlumb.bind("connection", function(conn, e) {
		//var lab = confirm("Please enter subnet name");
	});

	$("#addItem").click(function() {
		createItem("item"+count, 0);
		count++;
	});

	$("#generator").click(function() {
		var deviceList = $("#textarea").val().split("\n");
	
		if(listIsValid(deviceList)) {
			jsPlumb.deleteEveryEndpoint();
			jsPlumb.detachEveryConnection();
			
			$("#arealab").empty();
	
			$(deviceList).each(function(index, value) {
				if(value != "") {
					var arr = value.split(",");
					createItem(arr[0], arr[1]);
				};
			});
		} else {
			alert("You're device list is not valid!");
		};
	});

	$("#genlab").click(function() {
		var connections = jsPlumb.getConnections();
		var hasErrors = false;
		var array = [];
		
		$(connections).each(function(index, elem) {			
			var source = connections[index].endpoints[0].element.find("input").val();
			var sourceEth = connections[index].endpoints[0].getOverlays()[0].getLabel();
			var labRow1 = source + "[" + sourceEth.replace("eth", "") + "]=";

			var target = connections[index].endpoints[1].element.find("input").val();			
			var targetEth = connections[index].endpoints[1].getOverlays()[0].getLabel();
			var labRow2 = target + "[" + targetEth.replace("eth", "") + "]=";
			
			if(connections[index].overlays.length == 0) {
				connections[index].setPaintStyle({strokeStyle:"red"});
				hasErrors = true;
			} else {
				var label = connections[index].overlays[0].getLabel();
				labRow1 += label;
				labRow2 += label;
				
				array.push(labRow1);
				array.push(labRow2);
			};
		});
		if(hasErrors) {
			alert("Missing subnet name!");
		} else if(connections.length==0) {
			alert("No connections!");
		} else {
			array.sort();
			var result = "";
			$(array).each(function() {
				result += this+"<br/>";
			});
			$("#alert-placeholder").empty().append('<div class="alert alert-success alert-dismissable" ><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><strong>lab.conf</strong><p></p></div>');
			$(".alert p").html(result);
		};
	});
	
	$(document).on("click", ".add", function() {
		var id = $(this).parent().attr("id");
		var count;
		if(jsPlumb.getEndpoints(id) == undefined) {
			count = 0;
		} else {
			count = jsPlumb.getEndpoints(id).length;
		}
		var endpoint = {
			isSource:true,
			isTarget:true,
			connector: 'Straight',
			endpoint: [ "Dot", { radius: 7 } ],
			overlays:[ [ "Label", { label:"eth"+count, id:"label", location:[-0.5, -0.5] } ] ],
			anchor: "Continuous"
			//anchor: position[i]
			};
		jsPlumb.addEndpoint(id, endpoint);

		jsPlumb.repaintEverything();
	});

	$(document).on("click", ".remove", function() {
		var id = $(this).parent().attr("id");

		if(jsPlumb.getEndpoints(id) != undefined) {
			var count = jsPlumb.getEndpoints(id).length;
			jsPlumb.deleteEndpoint((jsPlumb.getEndpoints(id)[(count-1)]))
		}
	});

	$(document).on("click", ".delete", function() {
		jsPlumb.detachAllConnections($(this).parent());
		jsPlumb.remove($(this).parent());
	});

});

function createItem(id, interfaces) {
	var elem = '<div class="item" id="'+id+'"><span class="delete">x</span>'
		+'<input value="'+id+'" /><br/>'
		+'<button class="add btn btn-success btn-xs">+</button>&nbsp'
		+'<button class="remove btn btn-danger btn-xs">-</button></div>';
	$("#arealab").append(elem);
	
	var item = $("#arealab .item").eq(-2);
	if(item.length > 0) {
		// $($("#arealab .item").eq(-1)).position({
		// 	my: "center",
		// 	at: "center+25",
		// 	of: item
		// });
	};


	for(var i=0; i<interfaces; i++) {
		// anchor: [0, 0, 1, 1],
		// anchor:[ "Perimeter", { shape:"Circle", anchorCount: 30  } ] 
		var position = ["Top","Bottom","Right","Left","TopRight","BottomRight","BottomLeft","TopLeft"];
		var endpoint = {
			isSource:true,
			isTarget:true,
			connector: 'Straight',
			endpoint: [ "Dot", { radius: 7 } ],
			overlays:[ [ "Label", { label:"eth"+i, id:"label", location:[-0.5, -0.5] } ] ],
			anchor: position[i]
			};
		jsPlumb.addEndpoint(id, endpoint);
	};

	jsPlumb.draggable(id, {
		containment:"parent"
	});
}

function listIsValid(deviceList) {
	var valid = true;
	if(deviceList.length > 0) {
		// check for duplicates
		deviceList.sort();
		for(var i=0; i<deviceList.length-1; i++) {
			if (deviceList[i+1] == deviceList[i]) {
				valid = false;
				break;
			}
		}
		// check for device starting with "item". Not valid because it's a reserved ID
		for(var i=0; i<deviceList.length; i++) {
			if(deviceList[i].lastIndexOf("item", 0) === 0) {
				valid = false;
				break;
			}
		};
	}
	return valid;
}
