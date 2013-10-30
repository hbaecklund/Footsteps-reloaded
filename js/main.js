var map
var dirRendererOptions = {draggable: true};
var dirDisplay = new google.maps.DirectionsRenderer(dirRendererOptions);
var dirService = new google.maps.DirectionsService;
var total;
var dataArray = new google.maps.MVCArray();
var routeData = [];
var routes = {};
var selectedRoute = null;
var routeLinesRef = new Firebase('https://projectfootsteps.firebaseio.com/');
var routePaths = new Firebase('https://projectfootsteps.firebaseio.com/paths/');

function initialize() {

	var greymap = [
	{
		featureType: "all",
		elementType: "all",
		stylers: [ { saturation: -100 } ]
	}];

	var mapOptions = {
		center: new google.maps.LatLng(59.3294, 18.0686),
		zoom: 14,
		disableDefaultUI: false,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map"),mapOptions);
	dirDisplay.setMap(map);

	var mapType = new google.maps.StyledMapType(greymap, { name:"Grayscale" });
	map.mapTypes.set('thegrey', mapType);
	map.setMapTypeId('thegrey');

	// var heatmap = new google.maps.visualization.HeatmapLayer({
	// 	data: dataArray,
	// 	radius: 15,
	// 	dissipate: true,
	// 	maxIntensity: 10
	// });
	// heatmap.setMap(map);

}

google.maps.event.addDomListener(window, 'load', initialize);

// $('.form-group').keyup(function(){
// 	if ($('#startLoc').val() != "" && $('#endLoc').val() != "")
// 	{
// 		$('#btnAddTrip2');
// 	}
// 	else
// 	{
// 		$('#btnAddTrip2');
// 	}
// });

function clearMap()
{
	dirDisplay.setMap(null)
	//$('#btnSaveTrip');
	$('#btnClearMap');
	map.setCenter(new google.maps.LatLng(59.3294, 18.0686), 12);
}

function plotTrip()
{
	var dirRequest = {
		origin: $('#startLoc').val() + ", Stockholm, Sweden",
		destination: $('#endLoc').val() + ", Stockholm, Sweden",
		travelMode: google.maps.TravelMode.WALKING
	};
	dirDisplay.setMap(map);
	dirService.route(dirRequest, function(response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			dirDisplay.setDirections(response);
			$('#btnSaveTrip');
			$('#btnClearMap');
		}
	});
}

// function tripStats()
// {
// 	total = 0; 
// 	var myroute = dirDisplay.directions.routes[0]; 
// 	for (i = 0; i < myroute.legs.length; i++) { 
// 	total += myroute.legs[i].distance.value; 
// 	}
// 	total = Math.round(total/100)/10;
// 	startAdd = dirDisplay.directions.routes[0].legs[0].start_address; 
// 	endAdd = dirDisplay.directions.routes[dirDisplay.directions.routes.length-1].legs[dirDisplay.directions.routes[dirDisplay.directions.routes.length-1].legs.length-1].end_address; 
// 	$('#tripSpan').html('<b>Start Address:  </b>' + startAdd + ' | ' + '<b>End Address:  </b>' + endAdd + ' | ' + '<b>Distance:  </b> ' + total + "km")
// }

function saveTrip()
{
	routeData.clear();
	for (var i = 0; i < dirDisplay.directions.routes[0].legs.length; i++) {
		for (var j = 0; j < dirDisplay.directions.routes[0].legs[i].steps.length; j++) {
			routeData.push(dirDisplay.directions.routes[0].legs[i].steps[j].path);
		}
	}
	var routeInput = document.getElementById('routeName');
	var routeInput2 = routeInput.value;
	var rrr = {name: routeInput2, paths: routeData};
	routeLinesRef.push(rrr);
	
	// routeLinesRef.push(rrr, function(error){
	// 	if (error) {
	// 		$('#savedSpan').html('Data could not be saved.' + error);
	// 	} else {
	// 		$('#savedSpan').html('Data saved successfully!');
	// 	}
	// }
}


Array.prototype.clear = function() {
	this.splice(0, this.length);
};

//DANIEL'S CODE STARTS HERE:::

routeLinesRef.limit(10).on('child_added', function(snapshot)
{
	// loop over each route we get from firebase
	route = snapshot.val().paths;
	id = snapshot.name();

	// make an array that is initially blank
	// It will contain all the latitude and longitudes of each point on in the route
	var routeCoordinates = [];
	// This loops over each point on the route
	for (var i=0; i<route.length; i++)
	{
		// this part is magical.
		for (var j in route[i])
		{
			if (j==0 && i>0)
			{
				continue
			}
			else							
			{
				// This part just takes each point on the route, and converts it into 
				// a google maps LatLng object. For example, if the data is [58.23, 18.8], it will do:
				// new google.maps.LatLng(58.23, 18.8) to it, which turns it into a format that google maps likes.
				if (route[i][j].lb && route[i][j].mb) {
					routeCoordinates.push(new google.maps.LatLng
						(route[i][j].lb, route[i][j].mb));
							//console.log(j + ' ' + snapshot.val()[route][i][j].lb, snapshot.val()[route][i][j].mb);
						}
					}
				}
			}

	//console.log(routeCoordinates)

	// Create a route on google maps.
	var routePath = new google.maps.Polyline({
    	path: routeCoordinates, ///// THIS LINE HERE TELLS GOOGLE MAPS WHERE THE COORDINATES ARE FOR EACH POINT
    	geodesic: true,
    	strokeColor: '#FF0000', // if you want to change the color, do it here.
    	strokeOpacity: 0.5,
    	strokeWeight: 4
    });

  	// I have an object of routes. 
  	routes[id] = routePath;
  	
  	// Add the route to the map
  	routePath.setMap(map);

	// Set the route to be invisible. By default, all routes are HIDDEN until you hover over them in the sidebar menu.
	routePath.setVisible(false);

	// Add the routes to the list of routes
	// IN HERE YOU MUST ADD ANY ADDITIONAL NAMING THAT YOU WANT. EX: THE NAME OF THE ROUTE, ETC!!!!!
	$("#routesList").append("<li data-id=" + id + "><a href='#'>" + snapshot.val().name + "</a></li>");
});

$(function() {
	var $menu = $('nav#menu'),
	$html = $('html');

	// This happens when you click on one of the items in the sidebar
	$('#routesList').on('click', 'a', function(e) {
		// If you already have a route selected, then set its visibility to false(hidden).
		// This assumes that you are now picking a new route to show, so the old one must be hidden.
		if (selectedRoute) {
			routes[selectedRoute].setVisible(false);
		}
		// This is magical. Since the thing you are clicking on is a link, we must tell the browser NOT to redirect to a different page.
		// That is the default behaviour of a link. So "prevent" the default behaviour.
		e.preventDefault();
		
		// This removes the "selected" class from all routes. Just for styling, so it is no longer "highlighted."
		$("#routesList li").removeClass("Selected")
		// Now highlight the route that we did select
		$(this).parent("li").addClass("Selected");

		// Get the route that we selected. This comes from the data-id attribute that you can see on each <li>
		selectedRoute = $(this).parent("li").data('id');
		map.setZoom(14);

		// Using the id that we found, we can look up the appropriate route in our "routes" object.
		// Remember that we store an object with all the routes in it.
		// ex: 
		// routes = {
		// 	JQwrjwrwkjwler: ....,
		//  JKwenrwwldfdsf: .....,	
		// }
		// Once we have the appropriate route, we set its visibility to true...effectively showing it. yay!
		routes[selectedRoute].setVisible(true);

		var center = new google.maps.LatLng(routes[selectedRoute].latLngs.b[0].b[0].lb, routes[selectedRoute].latLngs.b[0].b[0].mb)
		map.setCenter(center);

		// Closes the menu.
		$menu.trigger("close");
	});

	// This line is used by the mmenu plugin that I used to make the lovely sidebar.
	$menu.mmenu();

	// When you hover on one of the routes in the sidebar, it shows that route on the map.
	$("#routesList").on("mouseenter", "li", function () {
		var id = $(this).data('id');
		routes[id].setVisible(true);
		var center = new google.maps.LatLng(routes[id].latLngs.b[0].b[0].lb, routes[id].latLngs.b[0].b[0].mb)
		map.setCenter(center);
		map.setZoom(12);
	}
	);

	// When you hover off of a route in the sidebar, it hides that route on the map.
	$("#routesList").on("mouseleave", "li", function () {
		var id = $(this).data('id');
		if (selectedRoute != id) {
			routes[id].setVisible(false);
		}
	}
	);
});

// routeLinesRef.on('value', function(snapshot)
// {
// 	dataArray.clear();
// 	for (var route in snapshot.val())
// 	{
// 		for (var i=0; i<route.length; i++)
// 		{
// 			for (var j in snapshot.val()[route][i])
// 			{
// 				if (j==0 && i>0)
// 				{
// 					continue
// 				}
// 				else							
// 				{
// 					dataArray.push(new google.maps.LatLng
// 						(snapshot.val()[route][i][j].lb, snapshot.val()[route][i][j].mb));
// 								//console.log(j + ' ' + snapshot.val()[route][i][j].lb, snapshot.val()[route][i][j].mb);								
// 							}
// 						}
// 					}
// 				}
// 			});