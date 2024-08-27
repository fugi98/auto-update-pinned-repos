name: Auto Pin Repos

on:
  push:
    branches:
      - main  # Trigger on push to the main branch, adjust as necessary
  workflow_dispatch:  # Allow manual trigger

jobs:
  pin-repos:
    runs-on: ubuntu-latest  # Use an appropriate runner for your environment

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'  # Use the Node.js version you need

      - name: Install dependencies
        run: |
          npm install @octokit/graphql @octokit/rest node-fetch

      - name: Run pin-repos script
        env:
          PAT: ${{ secrets.GITHUB_TOKEN }}  # Use GitHub token or your personal access token
        run: |
          node scripts/pin-repos.js  # Adjust the path if you saved the script elsewhere

      - name: Cleanup
        run: |
          # Any additional cleanup commands if needed
