require("dotenv").config();

//include the request npm package
var request = require("request");
var Spotify = require('node-spotify-api');
var moment = require('moment');
var fs = require('fs');
var keys = require("./keys.js");

//hidden keys for spotify
var spotifyId = keys.spotify.id;
var spotifySecret = keys.spotify.secret;

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
    console.log("\n" + ("Wrong Command! Available commands:") + 
    "\n\n" + " " + ("concert-this") + " <artist name>\n" + 
    " " + ("spotify-this-song") + " <song name>\n" +
    " " ("movie-this") + "  <movie name>\n" +
    " " + ("do-what-it-says") + " (runs command in random.txt\n");
process.exit(1);
};

function concertThis() {
    if (!input) {
        console.log("\n" + ("error: Invalid artist input!\n"));
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
                console.log("#" + (i + 1));
                console.log(("Venue: ") + data[i].venue.name);
                console.log(("Location: ") + data[i].venue.city + ", " + data[i].venue.country);
                console.log("Date: " + moment(data[i].datetime, 'YYYY-MM-DD').format('MM/DD/YYYY') + "\n");
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
        console.log("\nInvalid movie input. Defaulting to 'Mr. Nobody'")
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
            console.log(' ');
            console.log(("Title:  ") + data.Title);
            console.log(("Year:  ") + data.Year);
            console.log(("IMDB rating:  ") + data.imdbRating);
            console.log(("Rotten Tomatoes rating: ") + rottenTomatoes);
            console.log(("Produced in:  ") + data.Country);
            console.log(("Language:  ") + data.Language);
            console.log(("Plot: \n") + data.Plot);
            console.log("Actors: ");
            for (var f = 0; f < actorsArr.length; f++) {
                console.log('- ' + actorsArr[f].trim());
            };
            console.log(' ');

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

    function spotifyThisSong() {
         spotify = new Spotify ({
            id: spotifyId,
            secret: spotifySecret
        });
        if (!input) {
            console.log("\nInvalid song specified. Defaulting to XXX");
            var song = "XXX";
        } else {
            var song = input.trim();
        }
        spotify.search({
            type: 'track', query: song}, function (err,data) {
                if (err) return console.log('\nSong not found! \n')
                var name = data.tracks.items[0].name;
                var artist = data.tracks.items[0].artist[0].name;
                var album = data.tracks.items[0].album.name;
                var preview = data.tracks.items.items[0].preview_url;
                console.log(' ');
                console.log(("Title:  ") + name);
                console.log(("Artist:  ") + artist);
                console.log(("Album:  ")+ album);
                if (preview) {
                    console.log(("Preview (30 sec): ") + preview);
                } else {
                    console.log("No preview availble");
                };
                console.log(' ');
                
                var logData =
                `Title: ${name}\n` +
                `Artist: ${artist}\n` +
                `Album: ${album}\n` +
                `Preview: ${preview}\n`;

                logFile(logData);
                logFile("\n----------\n");
            });
    };
        function logFile(appendToLog) {
            fs.appendFile('log.txt', appendToLog, function(err){
                if (err) return console.log(err);
            });
        };