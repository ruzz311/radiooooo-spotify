const inquirer = require('inquirer');
const question = require('./lib/question');

inquirer
  .prompt([
    question.getMoods(),
    question.getDecades(),
  ])
  .then(res => question.getCountries(res.decade, res.moods))
  .then((countries) => {
    inquirer.prompt(countries);
  });
