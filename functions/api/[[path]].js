import { jsonError } from "../_lib/http.js";

// Unknown /api/* routes answer with JSON, not the HTML 404 page.
export function onRequest() {
  return jsonError(
    404,
    "api_route_not_found",
    "No API endpoint exists at this path.",
    "See https://numberforagents.com/openapi.json for the available endpoints."
  );
}
