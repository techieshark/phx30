// debugging globals
var g_locs; // locations
var g_resp; // response
var g_geojson;
var g_foo, g_bar;

// A handy sort function and a couple helpers
function sortByProp (propertyRetriever, arr) {
    arr.sort(function (a, b) {
        var valueA = propertyRetriever(a);
        var valueB = propertyRetriever(b);

        if (valueA < valueB) {
            return -1;
        } else if (valueA > valueB) {
            return 1;
        } else {
            return 0;
        }
    });
}
function distanceRetriever(obj) {
    return obj.distance.value;
}
function durationRetriever(obj) {
    return obj.duration.value;
}

// STUB
function getCurrentLocation() {
    return "33.4150,-111.8314";
}

// Given a GeoJSON of locations, find and merge in the distance & durations to each
// then call callback when done.
function distanceTo(locations, callback) {
    var origins      = [getCurrentLocation()];
    var destinations = _.map(locations, function(location) { return location.lat + "," + location.lon });

    var distanceMatrix  = new google.maps.DistanceMatrixService();

    var distanceRequest = {
        origins: origins,
        destinations: destinations,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
        avoidHighways: false,
        avoidTolls: false
    };

    distanceMatrix.getDistanceMatrix(distanceRequest, function(response, status) {
        if (status != google.maps.DistanceMatrixStatus.OK) {
            alert('Error was: ' + status);
        }
        else {
            g_resp = response; // DEBUGGING
            // var origins      = response.originAddresses;
            // var destinations = response.destinationAddresses;

            // console.log("Distance: " + response.rows[0].elements[0].distance.text + " (" + response.rows[0].elements[0].duration.text + ")");

            _.merge(locations, response.rows[0].elements);

            //g_bar = sortByProp(distanceRetriever, locations);
            g_foo = sortByProp(durationRetriever, locations);

            callback(locations);
        }
    });
}


function sendToConsole(locations) {

    // list: [ place, amenity, lat/lon, distance, duration, ]

    // display a list something like:
    // You're bored? Maybe you should check out...
    // The Mesa Arts Center (13 minutes away)
    // HeatSync Labs (14 minutes away)
    //
    // we get name of place and amenity type from geoJSON.
    // we get distance from google.
    //
    console.log("Bored? Maybe you should: ");

    for (var i = 0; i < locations.length; i++) {
        loc = locations[i];
        var start;
        if (loc.amenity) {
            start = "Go to a " + loc.amenity + " ("+loc.name+"). ";
        } else {
            start = "Go to " + loc.name + ". ";
        }
        console.log(start + "It is only " + loc.duration.text + " (" + loc.distance.text + ") away.");
    }
}

function sendToDOM(locations) {

    loc = locations[0];
    result = '<div class="col-lg-4">\
          <h2>' + loc.name + '</h2>\
          <p class="amenity">' + loc.amenity + '</p>\
          <p class="duration">' + loc.duration.text + '</p>\
          <p class="distance">' + loc.distance.text + '</p>\
          <p><a class="btn btn-default" href="#">View details &raquo;</a></p>\
        </div>';

    $("#result1").replaceWith(result);
}


function sendToMap(map) {
    return function(locations) {
        for (var i = 0; i < locations.length && i < 10; i++) {
            loc = locations[i];
            // add a marker in the given location, attach some popup content to it and open the popup
            L.marker([loc.lat, loc.lon]).addTo(map)
                .bindPopup(loc.name + ': ' + loc.duration.text + ' (' + loc.distance.text + ') away.')
                .openPopup();
        }
    }
}

$(document).ready(function() {

    // create a map in the "map" div, set the view to a given place and zoom
    // var map = L.map('map-canvas').setView([51.505, -0.09], 13);

    // // add an OpenStreetMap tile layer
    // L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    //     attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    // }).addTo(map); //

    // TODO: set location dynamically
    var map = L.mapbox.map('map-canvas', 'techieshark.hi1e3djc').setView([33.4150,-111.8314], 9);

    // L.marker([33.4150,-111.8314]).addTo(map)
    //     .bindPopup('YOU ARE HERE.')
    //     .openPopup();

    var circle = L.circle([33.4150,-111.8314], 2500, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5
    }).addTo(map);

    $.getJSON("places.geojson", function(json) {
        console.log(json);
        g_geojson = json; // DEBUG

        // Google Distance Matrix API lets us look up a 1 x 25 matrix of distances (1 origin, 25 destinations)
        // so we need to buid an array like [ (lat,lon)... ]
        // TODO: pull in more than 25
        var first25 = json.features.slice(0,25);
        var locations = g_locs = _.map(first25, function(f) {
            console.log("Found a " + f.properties.amenity + " (" + f.properties.name + ") at " + f.geometry.coordinates[1] + "," + f.geometry.coordinates[0] );
            return {
                "amenity": f.properties.amenity,
                "name": f.properties.name,
                "lat": f.geometry.coordinates[1], "lon": f.geometry.coordinates[0]
            };
        });

        distanceTo(locations, sendToMap(map));
    });


});
