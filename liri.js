require("dotenv").config();

//include the request npm package
var request = require("request");
var Spotify = require('node-spotify-api');
var moment = require('moment');
var fs = require('fs');
var keys = require("./keys.js");
var log = console.log;

//store all of the arguments in an array
//var nodeArgs = process.argv

var command = process.argv[2];
var input = process.argv[3];

//loop through all the commands in the node argument
for (var i = 4; i < process.argv.length; i++) {
    input += (" " + process.argv[i]);
};

//switch case
switch (command) {
    case "concert-this":
    concertThis();
    break;
    case "spotify-this-song":
    spotifyThisSong();
    break;
    case "movie-this":
    movieThis();
    break;
    case "do-what-it-says":
    doWhatItSays();
    break;
    default:
    help();
    break;
};

function help() {
    log("\n" + ("Wrong Command! Available commands:") + 
    "\n\n" + " " + ("concert-this") + " <artist name>\n" + 
    " " + ("spotify-this-song") + " <song name>\n" +
    " " ("movie-this") + "  <movie name>\n" +
    " " + ("do-what-it-says") + " (runs command in random.txt\n");
process.exit(1);
};

function concertThis() {
    if (!input) {
        log("\n" + ("error: Invalid artist input!\n"));
        log("Usage: node liri.js concert-this <artist-name>\n");
        return;
    } else {
        var artist = input.trim();
    };
    var queryUrl = "https://rest.bandsintown.com/artists/" + artist.replace(/ /g, "+") + "/events?app_id=" + keys.bandsintown;
    request(queryUrl, function(error, response, body) {
        if (error) return console.log(error);
        if(!error && response.statusCode === 200) {
            if (body.length < 20) {
                return log("\nNo results...\n");
            };
            var data = JSON.parse(body);
            for (var i = 0; i < 3; i++){
                log("#" + (i + 1));
                log(("Venue: ") + data[i].venue.name);
                log(("Location: ") + data[i].venue.city + ", " + data[i].venue.country);
                log("Date: " + moment(data[i].datetime, 'YYYY-MM-DD').format('MM/DD/YYYY') + "\n");
            var logData = 
                `Artist: ${artist}\n` +
                `Venue: ${data[i].venue.city}, ${data[i].venue.country}\n` +
                `Location: ${data[i].venue.city}, ${data[i].venue.country}\n` +
                "Date: " + moment(data[i].datetime, 'YYYY-MM-DD').format('MM/DD/YYYY') + "\n";
                logFile(logData);
                logFile("\n---------------\n");

            };
        };
    });
};

function movieThis() {
    if (!input) {
        log("\nInvalid movie input. Defaulting to 'Mr. Nobody'")
        var movie = "mr+nobody";
    } else {
        var movie = input.trim().replace(/ /g, "+");
    };
    var queryUrl = "http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=trilogy";
    request(queryUrl, function(error, response, body){
        if (error) return console.log(error);
        if (!error && response.statusCode === 200){
            var data = JSON.parse(body);
            if (data.Response == "False") return log("\nMovie not found!\n");
            var actors = data.Actors;
            var actorsArr = actors.split(',');
            if (data.Ratings == []) {
                var rottenTomatoes = "n/a"
            } else {
                if(data.Ratings.find(rating => rating.Source === "Rotten Tomatoes")) {
                    var rottenTomatoes = data.Ratings.find(rating => rating.Source === "Rotten Tomatoes").Value
                }else {
                    var rottenTomatoes = "n/a";
                }
            };
            log(' ');
            log(("Title:  ") + data.Title);
            log(("Year:  ") + data.Year);
            log(("IMDB rating:  ") + data.imdbRating);
            log(("Rotten Tomatoes rating: ") + rottenTomatoes);
            log(("Produced in:  ") + data.Country);
            log(("Language:  ") + data.Language);
            log(("Plot: \n") + data.Plot);
            log("Actors: ");
            for (var f = 0; f < actorsArr.length; f++) {
                log('- ' + actorsArr[f].trim());
            };
            log(' ');

            var logData =
            `Title: ${data.title}\n` +
            `Year: ${data.year}\n` +
            `IMDB rating: ${data.imbdbRating}\n` +
            `Rotten Tomatoes rating: ${data.Ratings[1].Value}\n` +
            `Produced in: ${data.Country}\n` +
            `Language: ${data.Language}\n` +
            `Plot: ${data.Plot}\n` +
            `Actors: ${actors}\n`;
            logFile(logData);
            logFile("\n---------------\n");
        };
    });
};

    function spotifyThisSong() {
        var spotify = new Spotify ({
            id: keys.spotify.id,
            secret: keys.spotify.secret,
        });
        if (!input) {
            log("\nInvalid song specified. Defaulting to The Sign Ace of base");
            var song = "The Sign Ace of base";
        } else {
            var song = input.trim();
        }
        spotify.search({
            type: 'track', query: song}, function (err,data) {
                if (err) return log('\nSong not found! \n')
                var name = data.tracks.items[0].name;
                var artist = data.tracks.items[0].artist[0].name;
                var album = data.tracks.items[0].album.name;
                var preview = data.tracks.items.items[0].preview_url;
                log(' ');
                log(("Title:  ") + name);
                log(("Artist:  ") + artist);
                log(("Album:  ")+ album);
                if (preview) {
                    log(("Preview (30 sec): ") + preview);
                } else {
                    log("No preview availble");
                };
                log(' ');
                
                var logData =
                `Title: ${name}\n` +
                `Artist: ${artist}\n` +
                `Album: ${album}\n` +
                `Preview: ${preview}\n`;

                logFile(logData);
                logFile("\n----------\n");
            });
    };

        function doWhatItSays() {
            fs.readFile('random.txt', 'utf8', function(err, data){
                if (err) return console.log(err);

                if(data.trim().includes("do-what-it-says")) {
                    log(("\nError") + " You cant call 'do-what-it-says' in random.txt choose another command\n"); 
                    return;
                };
                var arr = data.split(',');
                switch(arr[0]) {
                    case "concert-this":
                    input = arr[1].trim();
                    concertThis();
                    break;
                    case "spotify-this-song":
                    input = arr[1].trim();
                    spotifyThisSong();
                    break;
                    case "movie-this":
                    input = arr[1].trim();
                    movieThis();
                    break;
                    default:
                    help();
                    break;

                };
            });
        };
        function logFile(appendToLog) {
            fs.appendFile('log.txt', appendToLog, function(err){
                if (err) return console.log(err);
            });
        };