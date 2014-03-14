var g; //global var for debugging

$(document).ready(function() {

    console.log("eeeehlllooo!");
    var origins      = ["33.4150,-111.8314"];
    var destinations = ["33.3213094,-111.9116732"];

    var distanceMatrix  = new google.maps.DistanceMatrixService();
    var distanceRequest = { origins: origins, destinations: destinations, travelMode: google.maps.TravelMode.DRIVING, unitSystem: google.maps.UnitSystem.IMPERIAL, avoidHighways: false, avoidTolls: false };

    distanceMatrix.getDistanceMatrix(distanceRequest, function(response, status) {
        if (status != google.maps.DistanceMatrixStatus.OK) {
            alert('Error was: ' + status);
        }
        else {
            g = response;
            var origins      = response.originAddresses;
            var destinations = response.destinationAddresses;
            // rest of your code here...
            console.log(origins);
            console.log(destinations);

            console.log(response);

            console.log("Distance: " + response.rows[0].elements[0].distance.text + " (" + response.rows[0].elements[0].duration.text + ")");
        }
    });
});

// var ORIGIN = "33.4150,-111.8314";
// var DESTINATION = "33.3213094,-111.9116732";

// function httpGet(theUrl)
// {
//   var xmlHttp = null;

//   xmlHttp = new XMLHttpRequest();
//   xmlHttp.open( "GET", theUrl, false );
//   xmlHttp.send( null );
//   return xmlHttp.responseText;
// }

// var url = "http://maps.googleapis.com/maps/api/distancematrix/json?key=AIzaSyAzOF-EGWefl40wZ28RNwZLG4MRVQCw6cg&origins=" + ORIGIN + "&destinations=" + DESTINATION + "&sensor=true";

// var response = httpGet(url);

// console.debug("%o", response);
