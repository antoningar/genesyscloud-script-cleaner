module.exports = {
  default: {
    require: ['specs/step_definitions/**/*.ts'],
    requireModule: ['ts-node/register'],
    paths: ['specs/**/*.feature']
  }
};