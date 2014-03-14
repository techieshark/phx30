require 'rubygems'
require 'sinatra'

get '/try/:this' do
	"There's" + params[:this]
end