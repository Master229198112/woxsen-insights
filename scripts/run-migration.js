import('./generate-usernames-es6.mjs')
  .then(({ generateUsernames }) => {
    generateUsernames();
  })
  .catch(console.error);
