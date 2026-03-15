/**
 * Cliente xAPI (Experience API) para enviar statements a un LRS.
 * Configuración: XAPI_ENDPOINT, XAPI_KEY, XAPI_SECRET en .env
 * LRS gratuito: https://cloud.scorm.com (hasta 5,000 statements/mes).
 */

import XAPI from "@xapi/xapi";

const endpoint = process.env.XAPI_ENDPOINT ? process.env.XAPI_ENDPOINT.trim() : "";
const key = process.env.XAPI_KEY ? process.env.XAPI_KEY.trim() : "";
const secret = process.env.XAPI_SECRET ? process.env.XAPI_SECRET.trim() : "";

function getAuth(): string {
  if (!key || !secret) return "";
  if (typeof Buffer !== "undefined") {
    return "Basic " + Buffer.from(key + ":" + secret).toString("base64");
  }
  if (typeof btoa !== "undefined") {
    return "Basic " + btoa(key + ":" + secret);
  }
  return "";
}

const auth = getAuth();

const xapi =
  endpoint && auth
    ? new XAPI({
        endpoint,
        auth,
      })
    : null;

export default xapi;

export function isXAPIEnabled(): boolean {
  return xapi !== null && Boolean(endpoint) && Boolean(auth);
}
