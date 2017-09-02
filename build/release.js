'use strict';

const fs = require('fs');
const childProcess = require('child_process');
const path = require('path');
const semver = require('semver');
const moment = require('moment');
const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json');
const CHANGELOG_PATH = path.join(process.cwd(), 'CHANGELOG.md');
const packageFile = require(PACKAGE_JSON_PATH);

function exec(command) {
  return childProcess
    .execSync(command)
    .toString()
    .slice(0, -1);
}

const githubRepoUrl = exec('git config --get remote.origin.url').replace(
  /\.git$/,
  ''
);

function updatePackageJson(version) {
  fs.writeFileSync(
    PACKAGE_JSON_PATH,
    JSON.stringify(Object.assign({}, packageFile, { version }), null, 2) + '\n'
  );
}

function updateChangelog(newText) {
  fs.writeFileSync(CHANGELOG_PATH, newText);
}

function createGitCommit(version) {
  exec(
    `git commit -am 'Build: update package.json and changelog for v${version}'`
  );
}

function createGitTag(version) {
  exec(`git tag v${version}`);
}

function getCommitSubject(commitHash) {
  return exec(`git --no-pager show -s --oneline --format=%s ${commitHash}`);
}

function getAbbreviatedCommitHash(commitHash) {
  return exec(`git --no-pager show -s --oneline --format=%h ${commitHash}`);
}

function getCommitLink(commitHash) {
  return `[${getAbbreviatedCommitHash(
    commitHash
  )}](${githubRepoUrl}/commit/${commitHash})`;
}

function replaceIssueLinks(message) {
  return message.replace(/#(\d+)/g, `[#$1](${githubRepoUrl}/issues/$1)`);
}

const commitHashes = exec(`git log --format=%H v${packageFile.version}...HEAD`)
  .split('\n')
  .filter(hash => hash);

if (!commitHashes.length) {
  throw new RangeError('No commits since last release');
}

const commitSubjects = commitHashes.map(getCommitSubject);
let newVersion;

if (commitSubjects.some(subject => subject.startsWith('Breaking'))) {
  newVersion = semver.inc(packageFile.version, 'major');
} else if (
  commitSubjects.some(
    subject => subject.startsWith('Update') || subject.startsWith('New')
  )
) {
  newVersion = semver.inc(packageFile.version, 'minor');
} else {
  newVersion = semver.inc(packageFile.version, 'patch');
}

const newChangelogHeader = `## v${newVersion} (${moment
  .utc()
  .format('YYYY[-]MM[-]DD')})`;
const commitLines = commitHashes.map(
  hash =>
    `* ${replaceIssueLinks(getCommitSubject(hash))} (${getCommitLink(hash)})`
);
const oldChangelog = fs.readFileSync(CHANGELOG_PATH).toString();
const newChangelog = oldChangelog.replace(
  /^(# Changelog\n\n)/,
  `$1${newChangelogHeader}\n\n${commitLines.join('\n')}\n\n`
);

updatePackageJson(newVersion);
updateChangelog(newChangelog);
createGitCommit(newVersion);
createGitTag(newVersion);
