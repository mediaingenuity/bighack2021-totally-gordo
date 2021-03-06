const execa = require("execa");
const { Octokit } = require("octokit");

const octokit = new Octokit({
  auth: process.env.GITHUB_OAUTH_TOKEN,
});

async function run(name, cmd, opts = null) {
  console.log(`🏃 ${name} ${cmd}`);
  const cmdList = Array.isArray(cmd) ? cmd : cmd.split(" ");
  const _process = execa(name, cmdList, opts);
  _process.stdout.pipe(process.stdout);
  const { stdout } = await _process;
  return stdout;
}

async function getRepoList() {
  try {
    const repos = await octokit.paginate("GET /orgs/{org}/repos", {
      org: "mediaingenuity",
      per_page: 100,
    });

    return repos;
  } catch (e) {
    console.error(e);
  }
}

async function getLastCommitBefore(repoName, before) {
  const { data: commits } = await octokit.request(
    "GET /repos/{owner}/{repo}/commits",
    {
      owner: "mediaingenuity",
      repo: repoName,
      until: before,
      per_page: 1,
    }
  );

  return commits[0];
}

module.exports = { run, getRepoList, getLastCommitBefore };
