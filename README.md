# Credlock SIWES Portal

This repository is now the source-control home for the Credlock SIWES Portal.

## Architecture
- Frontend: React + Vite
- Backend API: Google Apps Script
- Database: Google Sheets
- File storage: Google Drive
- Deployment/source control: GitHub

## SuperAdmin
Designated SuperAdmin: `josepholayemi35@gmail.com`.

The portal PIN is a server-side secret and must not be committed to this repository.

## Google Sheet
The application is designed to use the connected SIWES Google Sheet as its authoritative data source through the Apps Script API.
