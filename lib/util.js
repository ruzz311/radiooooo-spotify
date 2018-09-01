const countries = require('./countries');

/**
 *
 * @param {array} songs - array of objecs with a nested contributor object
 * @param {string} decade - '1960'
 * @param {string} location - a country (ITA) or region (Southern Europe)
 * @returns {object} { title: '1960 - ITA', description: 'brought to you by...'}
 */
function createPlaylistMeta(songs, decade, location) {
  const contributors = [...new Set(
    songs.map(s => (s.contributor ? `${s.contributor.surname.trim()}` : null)).filter(i => i),
  )].concat('and Joe Longstreet');
  const title = `${decade} - ${location}`;
  const description = `Playlist brought to you by radiooooo.com. The following contributors made this possible: ${contributors.join(', ')}. You can contribute to new music discovery at patreon.com/radiooooo.`;

  return { title, description };
}

/**
 * @param {array} arr - any array of strings
 * @returns {string} item1, item2 and item 3
 */
function humanJoin(arr) {
  const last = arr[arr.length - 1];
  const commaJoined = arr.slice(0, -1).join(', ');
  return `${commaJoined} and ${last}`;
}

/**
 * @param {string} regionCode - any region-code found within the countries.json
 * @param {array} supportedCountryCodes - supported countries for this mood and decade request
 * @returns {array} array of countries from countries.json matching the given region code
 */
function getRandomCountryCodeFromRegion(regionCode, supportedCountryCodes) {
  const supportedCountries = countries.filter(c => supportedCountryCodes.includes(c['alpha-3']));
  const matches = supportedCountries.filter(c => c['sub-region-code'] === regionCode);
  const index = Math.floor(Math.random() * Math.floor(matches.length - 1));
  return matches[index]['alpha-3'];
}

/**
 * @param {array} countryCodes - any array of country codes - ['ITA', 'USA']
 * @returns {array} an array of region codes - ['039', '021']
 */
function getRegionsByCountryCodes(countryCodes) {
  return countryCodes
    .map(code => (
      countries.find(country => country['alpha-3'] === code)
    ))
    .filter(i => i);
}

/**
 * @param {string} regionCode - a region code 039
 * @returns {string} a region name Southern Europe
*/
function getRegionNameByRegionCode(regionCode) {
  return countries.find(country => (
    country['sub-region-code'] === regionCode
  ))['sub-region'];
}

module.exports = {
  createPlaylistMeta,
  humanJoin,
  getRandomCountryCodeFromRegion,
  getRegionsByCountryCodes,
  getRegionNameByRegionCode,
};
