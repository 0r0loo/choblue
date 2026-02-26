import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiFetch, api, ApiError, API_BASE_URL } from '@/lib/api';

describe('API Client', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Helper: 성공 응답 생성
  // ---------------------------------------------------------------------------
  function createSuccessResponse<T>(body: T, status = 200): Response {
    return {
      ok: true,
      status,
      json: () => Promise.resolve(body),
    } as Response;
  }

  // ---------------------------------------------------------------------------
  // Helper: 에러 응답 생성
  // ---------------------------------------------------------------------------
  function createErrorResponse(
    status: number,
    body: Record<string, unknown> = {},
  ): Response {
    return {
      ok: false,
      status,
      json: () => Promise.resolve(body),
    } as Response;
  }

  // ===========================================================================
  // apiFetch
  // ===========================================================================
  describe('apiFetch', () => {
    it('should send GET request to the correct URL with API_BASE_URL prefix', async () => {
      const responseBody = { id: '1', name: 'Test' };
      mockFetch.mockResolvedValue(createSuccessResponse(responseBody));

      await apiFetch('/users');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/users`,
        expect.objectContaining({}),
      );
    });

    it('should include credentials: include in the request', async () => {
      mockFetch.mockResolvedValue(createSuccessResponse({}));

      await apiFetch('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include',
        }),
      );
    });

    it('should include Content-Type: application/json header', async () => {
      mockFetch.mockResolvedValue(createSuccessResponse({}));

      await apiFetch('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('should parse and return the response JSON', async () => {
      const expectedData = { id: '1', name: 'Alice' };
      mockFetch.mockResolvedValue(createSuccessResponse(expectedData));

      const result = await apiFetch<typeof expectedData>('/users/1');

      expect(result).toEqual(expectedData);
    });

    it('should throw ApiError with status 404 when response is 404', async () => {
      const errorMessage = 'Not Found';
      mockFetch.mockResolvedValue(
        createErrorResponse(404, { message: errorMessage }),
      );

      await expect(apiFetch('/users/999')).rejects.toThrow(ApiError);
      await expect(apiFetch('/users/999')).rejects.toMatchObject({
        status: 404,
        message: errorMessage,
      });
    });

    it('should throw ApiError with status 401 when response is 401', async () => {
      const errorMessage = 'Unauthorized';
      mockFetch.mockResolvedValue(
        createErrorResponse(401, { message: errorMessage }),
      );

      await expect(apiFetch('/protected')).rejects.toThrow(ApiError);
      await expect(apiFetch('/protected')).rejects.toMatchObject({
        status: 401,
        message: errorMessage,
      });
    });

    it('should throw ApiError with status 500 when response is 500', async () => {
      const errorMessage = 'Internal Server Error';
      mockFetch.mockResolvedValue(
        createErrorResponse(500, { message: errorMessage }),
      );

      await expect(apiFetch('/crash')).rejects.toThrow(ApiError);
      await expect(apiFetch('/crash')).rejects.toMatchObject({
        status: 500,
        message: errorMessage,
      });
    });

    it('should throw ApiError with fallback message when error response has no message', async () => {
      mockFetch.mockResolvedValue(createErrorResponse(400, {}));

      await expect(apiFetch('/bad')).rejects.toThrow(ApiError);
      await expect(apiFetch('/bad')).rejects.toMatchObject({
        status: 400,
        message: 'Request failed',
      });
    });

    it('should throw ApiError with fallback message when error response body is not valid JSON', async () => {
      const invalidJsonResponse = {
        ok: false,
        status: 502,
        json: () => Promise.reject(new SyntaxError('Unexpected token')),
      } as Response;
      mockFetch.mockResolvedValue(invalidJsonResponse);

      await expect(apiFetch('/gateway-error')).rejects.toThrow(ApiError);
      await expect(apiFetch('/gateway-error')).rejects.toMatchObject({
        status: 502,
        message: 'Request failed',
      });
    });

    it('should return undefined when response status is 204 No Content', async () => {
      const noContentResponse = {
        ok: true,
        status: 204,
        json: () => Promise.reject(new Error('No body')),
      } as Response;
      mockFetch.mockResolvedValue(noContentResponse);

      const result = await apiFetch('/resource');

      expect(result).toBeUndefined();
    });
  });

  // ===========================================================================
  // api.get
  // ===========================================================================
  describe('api.get', () => {
    it('should send a GET request', async () => {
      const data = [{ id: '1' }];
      mockFetch.mockResolvedValue(createSuccessResponse(data));

      const result = await api.get<typeof data>('/users');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/users`,
        expect.objectContaining({
          // GET is the default, so no explicit method or method is undefined
        }),
      );
      expect(result).toEqual(data);
    });
  });

  // ===========================================================================
  // api.post
  // ===========================================================================
  describe('api.post', () => {
    it('should send a POST request with JSON stringified body', async () => {
      const requestBody = { name: 'New User', email: 'new@test.com' };
      const responseData = { id: '3', ...requestBody };
      mockFetch.mockResolvedValue(createSuccessResponse(responseData, 201));

      const result = await api.post<typeof responseData>(
        '/users',
        requestBody,
      );

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/users`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        }),
      );
      expect(result).toEqual(responseData);
    });
  });

  // ===========================================================================
  // api.patch
  // ===========================================================================
  describe('api.patch', () => {
    it('should send a PATCH request with JSON stringified body', async () => {
      const requestBody = { name: 'Updated' };
      const responseData = { id: '1', name: 'Updated' };
      mockFetch.mockResolvedValue(createSuccessResponse(responseData));

      const result = await api.patch<typeof responseData>(
        '/users/1',
        requestBody,
      );

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/users/1`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(requestBody),
        }),
      );
      expect(result).toEqual(responseData);
    });
  });

  // ===========================================================================
  // api.delete
  // ===========================================================================
  describe('api.delete', () => {
    it('should send a DELETE request', async () => {
      const noContentResponse = {
        ok: true,
        status: 204,
        json: () => Promise.reject(new Error('No body')),
      } as Response;
      mockFetch.mockResolvedValue(noContentResponse);

      await api.delete('/users/1');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/users/1`,
        expect.objectContaining({
          method: 'DELETE',
        }),
      );
    });
  });
});
