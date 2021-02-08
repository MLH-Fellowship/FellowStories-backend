const fs = require('fs');
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');
const { v4: uuidv4 } = require('uuid');
const simpleGit = require('simple-git');

const REPO_NAME = 'fellow-clone';
const git = simpleGit();

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create(ctx) {
    let entity;
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.story.create(data, { files });
    } else {
      const current_date = new Date().toISOString()
      const foundUser = await strapi.query('user', 'users-permissions').findOne({
        id: ctx.request.body.author,
      });
      const markdown = `---
title: ${ctx.request.body.title}
author: ${foundUser ? `${foundUser.firstname} ${foundUser.lastname}`.trim() : 'Anonymous'}
author_title: MLH Fellow
---

${ctx.request.body.content}
`
      const filename = `${current_date.substr(0, 10)}-${uuidv4()}.md`;
      // TODO: Push markdown to GitHub
      fs.writeFileSync(`~/${REPO_NAME}/stories/${filename}`, markdown);
      await git
        .cwd(`~/${REPO_NAME}`)
        .pull('origin', 'main', ['--no-rebase'])
        .add(`./stories/${filename}`)
        .commit(`Add: New story by ${ctx.state.user.email}`)
        .push('origin', 'main')

      // Add fields to body
      ctx.request.body.filename = filename;

      entity = await strapi.services.story.create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.story });
  },
  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.story.search(ctx.query);
    } else {
      // entities = await strapi.services.story.find(ctx.query);
      // Return only stories created by requesting user
      entities = await strapi.services.story.find({ author: ctx.state.user.id });
    }

    return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.story }));
  },
};
