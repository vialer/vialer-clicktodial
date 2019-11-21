import replaceString from 'replace-string';

const envVariableNames = [
  'API_URL',
  'APP_NAME',
  'BRAND_PRIMARY_COLOR',
  'BRAND_SECONDARY_COLOR',
  'BRAND',
  'BUILD',
  'CHANGE_PASSWORD_URL',
  'COLLEAGUES_URL',
  'HELP_URL',
  'LOGENTRIES_API_KEY',
  'PRIMARY_COLOR',
  'QUEUES_URL',
  'SENTRY_D',
  'SETTINGS_URL',
  'SHORT_NAME',
  'VENDOR_NAME',
  'VENDOR_PORTAL_NAME',
  'VENDOR_PORTAL_URL',
  'VENDOR_SUPPORT_EMAIL',
  'VENDOR_SUPPORT_PHONE',
  'VENDOR_SUPPORT_WEBSITE',
  'VERSION',
  'WEBPHONE_URL'
];
const env = process.env;

export default function replaceEnvVariables(content) {
  return Promise.resolve(
    envVariableNames.reduce((prev, varName) => {
      if (varName in env) {
        return replaceString(prev, `%%${varName}%%`, env[varName]);
      }
      return prev;
    }, content)
  );
}
