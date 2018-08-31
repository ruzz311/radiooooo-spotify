/**
 *
 * @param {array} songs - array of objecs with a nested contributor object
 * @param {string} decade - '1960'
 * @param {string} country - 'ITA'
 * @returns {object} { title: '1960 - ITA', description: 'brought to you by...'}
 */
function createPlaylistMeta(songs, decade, country) {
  const contributors = [...new Set(
    songs.map(s => (s.contributor ? `${s.contributor.surname.trim()}` : null)).filter(i => i),
  )].concat('and Joe Longstreet');
  const title = `${decade} - ${country}`;
  const description = `Playlist brought to you by radiooooo.com. The following contributors made this possible: ${contributors.join(', ')}. You can contribute to new music discovery at patreon.com/radiooooo.`;

  return { title, description };
}

module.exports = {
  createPlaylistMeta,
};
