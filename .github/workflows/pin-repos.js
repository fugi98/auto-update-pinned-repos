const { graphql } = require('@octokit/graphql');
const { Octokit } = require('@octokit/rest');
const fetch = require('node-fetch');

const PAT = process.env.PAT; // Personal Access Token

const octokit = new Octokit({
  auth: PAT,
  request: {
    fetch: fetch,
  },
});

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${PAT}`,
  },
  request: {
    fetch: fetch,
  },
});

async function pinRepositories() {
  try {
    // Fetch repositories
    const reposResponse = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 6,
    });

    // Map repository node IDs
    const pinnedRepos = reposResponse.data.map(repo => repo.node_id);

    console.log('Pinned Repos:', pinnedRepos);

    // Define GraphQL mutations
    const unpinMutation = `
      mutation($repoIds: [ID!]!) {
        unpinRepositories(input: { repositoryIds: $repoIds }) {
          clientMutationId
        }
      }
    `;

    const pinMutation = `
      mutation($repoId: ID!) {
        pinRepository(input: { repositoryId: $repoId }) {
          clientMutationId
        }
      }
    `;

    // Unpin repositories
    if (pinnedRepos.length > 0) {
      await graphqlWithAuth(unpinMutation, {
        repoIds: pinnedRepos,
      });

      console.log('Unpinned Repos:', pinnedRepos);
    }

    // Pin repositories
    for (const repoId of pinnedRepos) {
      await graphqlWithAuth(pinMutation, {
        repoId: repoId,
      });
    }

    console.log('Pinned Repos:', pinnedRepos);

  } catch (error) {
    console.error('Error pinning repositories:', error);
    process.exit(1);
  }
}

pinRepositories();
