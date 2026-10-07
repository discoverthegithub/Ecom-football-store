/**
 * Standardized API Response
 * -------------------------
 * Ensures every successful response follows a consistent JSON structure:
 *
 * {
 *   "success": true,
 *   "message": "...",
 *   "data": { ... }
 * }
 *
 * Usage:
 *   res.status(200).json(new ApiResponse(200, data, 'Product fetched'));
 *   ApiResponse.send(res, 201, data, 'Created');
 */

class ApiResponse {
  /**
   * @param {number} statusCode — HTTP status code
   * @param {*} data — Response payload
   * @param {string} message — Human-readable success message
   */
  constructor(statusCode, data = null, message = 'Success') {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  // ---- Static Helper Methods ----

  /**
   * Send a standardized JSON response.
   * @param {import('express').Response} res — Express response object
   * @param {number} statusCode — HTTP status code
   * @param {*} data — Response payload
   * @param {string} message — Human-readable message
   */
  static send(res, statusCode, data = null, message = 'Success') {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
  }

  /**
   * 200 OK
   */
  static ok(res, data = null, message = 'Success') {
    return ApiResponse.send(res, 200, data, message);
  }

  /**
   * 201 Created
   */
  static created(res, data = null, message = 'Created successfully') {
    return ApiResponse.send(res, 201, data, message);
  }

  /**
   * 204 No Content (no body)
   */
  static noContent(res) {
    return res.status(204).send();
  }

  /**
   * Paginated response with metadata.
   * @param {import('express').Response} res
   * @param {Array} data — Array of records
   * @param {object} pagination — { page, limit, total, totalPages }
   * @param {string} message
   */
  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
    });
  }
}

export default ApiResponse;
