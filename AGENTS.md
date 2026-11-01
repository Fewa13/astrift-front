# Astrift development workflow

- User preference (2026-11-01): after completing and validating each change, commit and push the relevant project updates to the configured GitHub repository as part of finishing the work.
- Keep the existing main site, Workers, Surge, Firebase, and single-HTML update workflow in sync as applicable. GitHub is an additional delivery target.
- Never commit API keys, passwords, tokens, `.dev.vars`, local credential files, `.wrangler/`, `.firebase/`, or private account data. Review staged changes before committing.
- If no GitHub remote has been configured, request the user's intended repository URL instead of guessing a repository or publishing to a new one.

- GitHub remote: `https://github.com/Fewa13/astrift-front.git`, branch `main`. Preserve existing history; do not force-push. The legacy `astrift-pages-upload-20261003/` and its Pages workflow are retained; uploading source does not mean that legacy GitHub Pages site has been updated.
