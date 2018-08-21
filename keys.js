console.log('this is loaded');

let spotify = {
  id: process.env.SPOTIFY_ID,
  secret: process.env.SPOTIFY_SECRET
}

let  omdb = process.env.OMDB_KEY;

let bandsintown = process.env.BANDS_IN_TOWN_KEY;

module.exports = {
  spotify: spotify,
  omdb: omdb,
  bandsintown: bandsintown,
};
