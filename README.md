# ShopPost

An English-language workspace for planning product posts across social and marketplace channels.

## Current preview

The static preview runs in a browser. It can save caption and listing drafts to that browser's local storage, show selected channels and requested times, and collect basic Carousell listing details. It records a selected photo's filename only; it does **not** upload photos, publish posts, connect accounts, or sync data between devices. Do not enter passwords, access tokens, or payment information here.

## Channel plan

- **Facebook Page:** connect with Meta's official OAuth and Pages publishing API after creating and reviewing a Meta developer app.
- **Instagram:** publish through Meta's supported publishing API for an eligible professional account.
- **Carousell:** prepare a listing draft in ShopPost, then review and submit it on Carousell. Automated browser or bot posting is not included.
- **More channels:** add one connector at a time where an official API or authorized partner integration supports the desired action.

The production app will need a secure backend for account tokens, scheduled jobs, provider callbacks, media storage, and a publish history. Tokens must not be stored in browser local storage or committed to this repository.

## Run locally

Open `index.html` in a modern browser. Drafts stay in that browser. GitHub Pages deploys this static preview from the `main` branch.

## Deployment

The GitHub Actions workflow in `.github/workflows/pages.yml` publishes the static preview to GitHub Pages after a push to `main`.
