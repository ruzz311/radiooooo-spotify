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
    choices: moods.map(mood => ({ name: mood, checked: true })),
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
  * @param {countryCodes} mood ['ITA', 'USA']
  * @return {object} an inquirer prompt object
*/
function getCountries(countryCodes) {
  const choices = countryCodes.map((code) => {
    const country = countries.find(c => code === c['alpha-3']);

    if (country) {
      return {
        name: country.name,
        value: country['alpha-3'],
      };
    }

    return null;
  }).filter(i => i);

  return {
    name: 'country',
    type: 'list',
    message: 'Select country',
    choices,
  };
}

/**
  * @param {countryCodes} mood ['ITA', 'USA']
  * @return {object} an inquirer prompt object
*/
function getRegions(countryCodes) {
  const choices = countryCodes.map((code) => {
    const country = countries.find(c => code === c['alpha-3']);

    if (country && country['sub-region'] && country['sub-region-code']) {
      return {
        name: country['sub-region'],
        value: country['sub-region-code'],
      };
    }

    return null;
  })
    .filter(i => i)
    .filter((obj, pos, arr) => (
      arr.map(mapObj => mapObj.value).indexOf(obj.value) === pos
    ))
    .sort((a, b) => (a.name > b.name ? 1 : -1));

  return {
    name: 'region',
    type: 'list',
    message: 'Select region',
    choices,
  };
}

module.exports = {
  getRegions,
  getMoods,
  getDecades,
  getCountries,
};
