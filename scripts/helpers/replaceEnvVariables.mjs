import replaceString from 'replace-string';

const envVariableNames = [
  'BUILD',
  'APP_NAME',
  'BRAND',
  'SHORT_NAME',
  'VENDOR_NAME',
  'VENDOR_PORTAL_NAME',
  'VENDOR_SUPPORT_WEBSITE',
  'VENDOR_PORTAL_URL',
  'VENDOR_SUPPORT_EMAIL',
  'VENDOR_SUPPORT_PHONE',
  'LOGENTRIES_API_KEY',
  'BRAND_PRIMARY_COLOR',
  'BRAND_SECONDARY_COLOR',
  'PRIMARY_COLOR',
  'SENTRY_D',
  'VERSION'
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
