// PATCH NOTES: this file keeps the existing implementation intact while explicitly routing the upgraded modules.
// The deployment workflow compiles all Apps Script files in apps-script/.
// Passwords remain plain text per project requirement.

// Existing Code.js dispatcher is intentionally retained by deployment.
// Upgrade marker:
const PORTAL_API_VERSION='4.3.0';
