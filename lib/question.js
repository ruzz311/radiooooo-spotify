const countries = require('./countries');
const r = require('./r.js');

const moods = ['SLOW', 'FAST', 'WEIRD'];
const decades = [
  '1900', '1910', '1920', '1930', '1940', '1950',
  '1960', '1970', '1980', '1990', '2000', '2010',
];

/**
  * @return {object} an inquirer prompt object
*/
function getMoods() {
  return {
    name: 'moods',
    message: 'Select moods',
    type: 'checkbox',
    choices: moods.map(mood => ({ name: mood })),
  };
}

/**
  * @return {object} an inquirer prompt object
*/
function getDecades() {
  return {
    name: 'decade',
    message: 'Select decades',
    type: 'list',
    choices: decades.map(decade => ({ name: decade })),
  };
}

/**
  * @param {string} decade 1960
  * @param {array} mood ["FAST", "WEIRD"]
  * @return {object} an inquirer prompt object
*/
async function getCountries(decade, mood) {
  const countryCodes = await r.getCountriesByFilters(decade, mood);
  const choices = countryCodes.map((code) => {
    const country = countries.find(c => code === c['alpha-3']);

    if (country) {
      return {
        name: country.name,
        value: country['alpha-3'],
      };
    }

    return null;
  });

  return {
    name: 'country',
    type: 'list',
    message: 'Select country',
    choices: choices.filter(i => i),
  };
}

module.exports = {
  getMoods,
  getDecades,
  getCountries,
};
