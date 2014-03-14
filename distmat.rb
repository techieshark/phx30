require 'rubygems'
require 'google_distance_matrix'
require 'sinatra'
require 'net/http'
require 'json'

puts RUBY_VERSION

get '/:xy.json' do 
	content_type :json
 	
 	ltln = params[:xy].split(",").map(&:to_f)
 	print(ltln)
	matrix = GoogleDistanceMatrix::Matrix.new
	o1 = GoogleDistanceMatrix::Place.new lng: ltln[1], lat: ltln[0]
	d1 = GoogleDistanceMatrix::Place.new lng: -111.9116732, lat: 33.3213094 
	matrix.origins << o1
	matrix.destinations << d1

	matrix.data.to_json
	
end

