require 'rubygems'
#require 'google_distance_matrix'
require 'sinatra'
require 'net/http'

DESTINATION = "33.3213094,-111.9116732"

get '/:xy' do
  "You are at #{params[:xy]}!"

=begin
	url = URI.parse("https://maps.googleapis.com/maps/api/distancematrix/json?key=AIzaSyAzOF-EGWefl40wZ28RNwZLG4MRVQCw6cg&origins=" + params[:xy] + "&destinations=" + DESTINATION + "&sensor=true")
	req = Net::HTTP::Get.new(url.path)
	res = Net::HTTP.start(url.host, url.port) {|http|
	  http.request(req)
	}

	puts res.body
=end

end

