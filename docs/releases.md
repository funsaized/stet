# Releases and GitHub Packages

The public npm package remains `@funsaized/stet`. GitHub Packages provides an
additional registry linked to `funsaized/stet`; it does not replace npmjs.org.

## Publish a release

1. Update the root package version, lockfile, and changelog. Run the library checks
   (`check`, `test`, `size`, `test:templates`, `test:package`, `test:patterns`,
   `test:browser`, `test:demos`) and require green CI, including WebKit and the
   native Linux/Windows CLI matrix. Pack once with `npm pack --ignore-scripts`,
   then publish that verified archive to npm with `npm publish <archive> --access public`.
   Verify the published archive with `npm run test:cli-consumer -- <archive>`.
   Update the website’s exact dependency, lockfile, version labels and docs,
   and run its quality/browser checks before merging release changes.
2. Commit the release changes and create a matching `v<version>` tag.
3. Publish a GitHub release for that tag. The **Publish GitHub package** workflow
   checks the tagged source, downloads the published npm artifact, verifies its
   SHA-512 integrity, and publishes its contents to GitHub Packages.
4. The workflow attaches the original npm tarball and `SHA256SUMS` to the release.

The GitHub mirror changes only the archive's `publishConfig.registry` metadata.
The executable library files come from the existing npm publication. The original
release tarball is unchanged. A release whose version is not on npm fails rather
than silently publishing a different build.

The workflow uses the repository's `GITHUB_TOKEN` with `packages: write` and
`contents: write`. No personal access token or npm publishing secret is required
in repository settings. Root npm configuration continues to target npmjs.org,
so website installs and the existing npm publishing process are unaffected.

## Install from GitHub Packages

GitHub requires authentication even for public npm packages. Use a personal
access token (classic) with `read:packages` and access to this package:

```sh
npm login --scope=@funsaized --auth-type=legacy --registry=https://npm.pkg.github.com
npm install @funsaized/stet@0.1.0 --registry=https://npm.pkg.github.com
```

Alternatively, use environment substitution in your consuming project's `.npmrc`:

```ini
@funsaized:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Keep token values out of Git. The npmjs.org installation needs no GitHub token.

New GitHub packages default to private visibility. Package administrators can
change visibility under the package's settings; repository linkage alone does
not make the package public.

See [GitHub's npm registry documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
and [publishing Node.js packages](https://docs.github.com/en/actions/tutorials/publish-packages/publish-nodejs-packages).
