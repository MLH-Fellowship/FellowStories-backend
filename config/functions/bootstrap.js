require('dotenv').config();
const simpleGit = require('simple-git');

const REPO_NAME = 'fellow-clone';
const options = {
  baseDir: process.cwd(`../${REPO_NAME}`),
}
const git = simpleGit(options);

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/concepts/configurations.html#bootstrap
 */

module.exports = async () => {
  strapi.log.info('TEST INIT')

  // Clone repo
  try {
    await git.cwd('..').clone(process.env.GITHUB_REPO_TO_CLONE, REPO_NAME);
    strapi.log.info('CLONED');
  } catch(e) {
    strapi.log.info('NOT CLONED', e);
  }
};
