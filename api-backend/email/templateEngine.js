const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const TEMPLATES_DIR = path.join(__dirname, 'templates');

const compileTemplate = (templateName) => {
  const filePath = path.join(TEMPLATES_DIR, `${templateName}.hbs`);
  const src = fs.readFileSync(filePath, 'utf8');
  return Handlebars.compile(src);
};

const renderTemplate = (templateName, variables = {}) => {
  const tpl = compileTemplate(templateName);
  return tpl(variables);
};

module.exports = { renderTemplate, TEMPLATES_DIR };
