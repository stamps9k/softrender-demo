import debug from "debug";

/*---------------------------------------------------------------------------*/
const logger_api = {
  //Raw DB connection, query timing, errors
  super_super_verbose_api_db: debug("api:db:SUPER_SUPER_VERBOSE"),
  super_verbose_api_db: debug("api:db:SUPER_VERBOSE"),
  verbose_api_db: debug("api:db:VERBOSE"),
  info_api_db: debug("api:db:INFO"),
  warn_api_db: debug("api:db:WARN"),
  error_api_db: debug("api:db:ERROR"),
};

logger_api["super_super_verbose_api_db"](
  "Super Super Verbose debugging enabled for API db connections.",
);
logger_api["super_verbose_api_db"](
  "Super Verbose debugging enabled for API db connections.",
);
logger_api["verbose_api_db"](
  "Verbose debugging enabled for API db connections.",
);
logger_api["info_api_db"]("Info debugging enabled for API db connections.");
logger_api["warn_api_db"]("Warn debugging enabled  for API db connections.");
logger_api["error_api_db"]("Error debugging enabled for API db connections.");
/*---------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------*/
const logger = {
  // Logging for anything managed entirely by this webapp
  super_super_verbose_webapp: debug("js:webapp:SUPER_SUPER_VERBOSE"),
  super_verbose_webapp: debug("js:webapp:SUPER_VERBOSE"),
  verbose_webapp: debug("js:webapp:VERBOSE"),
  info_webapp: debug("js:webapp:INFO"),
  warn_webapp: debug("js:webapp:WARN"),
  error_webapp: debug("js:webapp:ERROR"),
};

logger["super_super_verbose_webapp"](
  "Super Super Verbose logging enabled for webapp.",
);
logger["super_verbose_webapp"]("Super Verbose logging enabled for webapp.");
logger["verbose_webapp"]("Verbose logging enabled for webapp.");
logger["info_webapp"]("Info logging enabled for webapp.");
logger["warn_webapp"]("Warn logging enabled  for webapp.");
logger["error_webapp"]("Error logging enabled for webapp.");

console.log("");
console.log("");
console.log("");

/*---------------------------------------------------------------------------*/

// Export from this module for access in rest of project
export { logger, logger_api };
