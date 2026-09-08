# Credlock SIWES Portal

Production source for the Credlock SIWES management portal.

## Architecture
- **Frontend:** React + Vite
- **Backend:** Google Apps Script Web App
- **Database:** Google Sheets
- **File storage:** Google Drive (through Apps Script)
- **Source control:** GitHub
- **Web hosting:** GitHub Pages

## Included workspaces
Dashboard, Students, Attendance, Daily Logbook, Ticket Log, 12-Week Learning Plan, Assessments, Reports and Settings.

## Data flow
`GitHub Pages → Google Apps Script API → Google Sheets / Google Drive`

The backend is intentionally kept on Google Apps Script and the Google Sheet remains the authoritative database.

## Production configuration
The frontend is configured to call the deployed Apps Script API. The connected SIWES workbook is referenced by the backend configuration; do not expose spreadsheet credentials or portal PINs in source control.

## GitHub Pages
A GitHub Actions workflow in `.github/workflows/deploy-pages.yml` builds the Vite application and publishes `dist` to GitHub Pages on pushes to `main`.

If Pages has not yet been enabled for the repository, open **Settings → Pages → Source** and select **GitHub Actions** once. Subsequent pushes deploy automatically.

## SuperAdmin
Designated SuperAdmin: `josepholayemi35@gmail.com`.

The portal PIN is a server-side secret and is deliberately not stored in this repository.
