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

    var google_item_limit = 25;

    var distanceRequest = {
        origins: origins,
        destinations: destinations.slice(0, 25),
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
        avoidHighways: false,
        avoidTolls: false
    };

    // Goal: process destinations array, which may be longer than Google wants to deal with
    // Assume: We cannot process the whole array at once. In fact, we can
    //         only process ITEM_LIMIT (google_item_limit) items per request.
    // Strategy: Process the array a chunk at a time. When the request has been fulfilled, start
    //           processing the next chunk.
    // destinations: [ "lat,lon", "lat,lon", ...]
    var n_completed = 0;
    var n_destinations = destinations.length;
    var results = [];

    function recursiveRequestor(n_completed) {
        return function(response, status) {

            if (status != google.maps.DistanceMatrixStatus.OK) {
                alert('Error was: ' + status); // He's Dead, Jim! (Our request failed.)
            } else { // All Systems Go.
                g_resp = response; // DEBUGGING
                // console.log("Distance: " + response.rows[0].elements[0].distance.text + " (" + response.rows[0].elements[0].duration.text + ")");

                // push all of response elements onto the ever growing results array
                results.push.apply(results, response.rows[0].elements);

                if (n_completed >= n_destinations) {
                // if (n_completed >= 74) {
                    // We've hit bottom! We're done. Return to surface.
                    // Sort the locations
                    _.merge(locations, results);
                    g_locs = locations = _.filter(locations, "duration");
                    g_locs = locations = _.filter(locations, function(location) { return location.duration.value <= 1800});

                    g_foo = sortByProp(durationRetriever, locations);
                    callback(locations);
                    return;
                } else {
                    // Keep going!
                    // "He who would search for pearls must dive below." -- John Dryden

                    var slice_end;
                    if (n_completed + google_item_limit > n_destinations) { // but don't go to far!
                        slice_end = n_destinations;
                    } else {
                        slice_end = n_completed + google_item_limit;
                    }

                    console.log("Processing elements " + n_completed + " to " + slice_end + ".");

                    distanceRequest.destinations = destinations.slice(n_completed, slice_end);
                    distanceMatrix.getDistanceMatrix(distanceRequest, recursiveRequestor(slice_end))
                }
            }
        }
    }

    // Go! Fight! Win!
    distanceMatrix.getDistanceMatrix(distanceRequest, recursiveRequestor(25));
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
        for (var i = 0; i < locations.length /*&& i < 10*/; i++) {
            loc = locations[i];
            // add a marker in the given location, attach some popup content to it and open the popup
            L.marker([loc.lat, loc.lon]).addTo(map)
                .bindPopup(loc.name + ': ' + loc.duration.text + ' away (' + loc.distance.text + ').')
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
    var map = L.mapbox.map('map-canvas', 'wendycfa.hi243873').setView([33.4150,-111.8314], 9);

    // YOU ARE HERE circle.
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
        var features = json.features.slice(0,101); // Google rate limits us at 100 per 10 seconds
        var locations = g_locs = _.map(features, function(f) {
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
