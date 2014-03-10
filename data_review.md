Limits:
Users of the free API:
100 elements per query.
100 elements per 10 seconds.
2 500 elements per 24 hour period.

more:
https://developers.google.com/maps/documentation/distancematrix/#Limits

Parameters:
origins - pipe delimited address or coordinates (lat,long)
destinations - ditto
sensor - true/false

optional:
mode (driving, walking, bicycling)

returns:
matrix of distances

Wikipedia:
http://wikilocation.org/documentation/

Parameters: lat, long, radius (max 20km), limit (50 max), offset (pagination)
http://api.wikilocation.org/articles?lat=51.500688&lng=-0.124411&limit=1

```
{
    "articles": [
        {
            "id": "7290308",
            "lat": "51.5006",
            "lng": "-0.124611",
            "title": "Big Ben",
            "url": "http:\/\/en.wikipedia.org\/w\/index.php?curid=7290308",
            "distance": "17m"
        }
    ]
}
```

Blog on Combining Wikipedia/Foursquare:
http://www.hackdiary.com/2012/04/05/extracting-a-social-graph-from-wikipedia-people-pages/

