var map
var dirRendererOptions = {draggable: true};
var dirDisplay = new google.maps.DirectionsRenderer(dirRendererOptions);
var dirService = new google.maps.DirectionsService;
var total;
var dataArray = new google.maps.MVCArray();
var routeData = [];
var bikeLinesRef = new Firebase('https://projectfootsteps.firebaseio.com/');

function initialize() {
	var mapOptions = {
		center: new google.maps.LatLng(59.3294, 18.0686),
		zoom: 14,
		disableDefaultUI: true,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map"),mapOptions);
	dirDisplay.setMap(map);
	var heatmap = new google.maps.visualization.HeatmapLayer({
		data: dataArray,
		radius: 15,
		dissipate: true,
		maxIntensity: 10
	});
	heatmap.setMap(map);
}
google.maps.event.addDomListener(window, 'load', initialize);

$('.txtLoc').keyup(function(){
	if ($('#startLoc').val() != "" && $('#endLoc').val() != "")
	{
		$('#btnAddTrip2').removeClass('ui-disabled');
	}
	else
	{
		$('#btnAddTrip2').addClass("ui-disabled");
	}
});

function clearMap()
{
	dirDisplay.setMap(null)
	$('#btnSaveTrip').addClass('ui-disabled');
	$('#btnClearMap').addClass('ui-disabled');
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
			$('#btnSaveTrip').removeClass('ui-disabled');
			$('#btnClearMap').removeClass('ui-disabled');
		}
	});
}

function tripStats()
{
	total = 0; 
	var myroute = dirDisplay.directions.routes[0]; 
	for (i = 0; i < myroute.legs.length; i++) { 
		total += myroute.legs[i].distance.value; 
	}
	total = Math.round(total/100)/10;
	startAdd = dirDisplay.directions.routes[0].legs[0].start_address; 
	endAdd = dirDisplay.directions.routes[dirDisplay.directions.routes.length-1].legs[dirDisplay.directions.routes[dirDisplay.directions.routes.length-1].legs.length-1].end_address; 
	$('#tripSpan').html('<u>Start Address:</u><br>' + startAdd + '<br><br><u>End Address:</u><br>' + endAdd + '<br><br><u>Distance:</u> ' + total + "km<br><br>")
}

function saveTrip()
{
	routeData.clear();
	for (var i = 0; i < dirDisplay.directions.routes[0].legs.length; i++) {
		for (var j = 0; j < dirDisplay.directions.routes[0].legs[i].steps.length; j++) {
			routeData.push(dirDisplay.directions.routes[0].legs[i].steps[j].path);
		}
	}
	console.log(routeData);

	bikeLinesRef.push(routeData, function(error){
		if (error) {
			$('#savedSpan').html('Data could not be saved.' + error);
		} else {
			$('#savedSpan').html('Data saved successfully!');
		}
	});
}

Array.prototype.clear = function() {
	this.splice(0, this.length);
};

bikeLinesRef.on('value', function(snapshot)
{
	dataArray.clear();
	for (var route in snapshot.val())
	{
		for (var i=0; i<route.length; i++)
		{
			for (var j in snapshot.val()[route][i])
			{
				if (j==0 && i>0)
				{
					continue
				}
				else							
				{
					dataArray.push(new google.maps.LatLng
						(snapshot.val()[route][i][j].lb, snapshot.val()[route][i][j].mb));
								//console.log(j + ' ' + snapshot.val()[route][i][j].lb, snapshot.val()[route][i][j].mb);
								
							}
						}
					}
				}
			});