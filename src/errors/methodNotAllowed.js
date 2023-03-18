// Exports the 405 Method Not Allowed handler function for use by the Express application.

function methodNotAllowed(request, response, next) {
  next({
    status: 405,
    message: `${request.method} not allowed for ${request.originalUrl}`,
  });
}

module.exports = methodNotAllowed;
