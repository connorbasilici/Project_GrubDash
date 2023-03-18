// Exports the 404 Not Found handler function for use by the Express application.

function notFound(request, response, next) {
  next({ status: 404, message: `Path not found: ${request.originalUrl}` });
}

module.exports = notFound;
