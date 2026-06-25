import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_API_ORIGIN = 'http://10.0.2.2:4000';
const DEFAULT_TIMEOUT_MS = 15_000;

type QueryValue = string | number | boolean | null | undefined;

export interface ApiRequestOptions<TBody = unknown> extends Omit<RequestInit, 'body'> {
  auth?: boolean;
  body?: TBody | BodyInit | null;
  query?: Record<string, QueryValue>;
  timeoutMs?: number;
}

export class ApiError<TData = unknown> extends Error {
  readonly status: number;
  readonly data?: TData;
  readonly url: string;
  readonly cause?: unknown;

  constructor(
    message: string,
    options: { status: number; url: string; data?: TData; cause?: unknown },
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.url = options.url;
    this.data = options.data;
    this.cause = options.cause;
  }
}

export function normalizeApiBaseUrl(value?: string): string {
  const configuredUrl = value?.trim() || DEFAULT_API_ORIGIN;
  const withoutTrailingSlashes = configuredUrl.replace(/\/+$/, '');

  return /\/api$/i.test(withoutTrailingSlashes)
    ? withoutTrailingSlashes
    : `${withoutTrailingSlashes}/api`;
}

export const API_BASE_URL = normalizeApiBaseUrl(process.env.EXPO_PUBLIC_API_URL);

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const queryString = Object.entries(query ?? {})
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return `${API_BASE_URL}${normalizedPath}${queryString ? `?${queryString}` : ''}`;
}

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

function prepareBody(body: unknown, headers: Headers): BodyInit | null | undefined {
  if (body === undefined || body === null || typeof body === 'string' || isFormData(body)) {
    return body as BodyInit | null | undefined;
  }

  if (body instanceof Blob || body instanceof ArrayBuffer) return body;

  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return JSON.stringify(body);
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;

  const text = await response.text();
  if (!text) return undefined;

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch {
      throw new ApiError('The server returned invalid JSON.', {
        status: response.status,
        url: response.url,
        data: text,
      });
    }
  }

  return text;
}

function getErrorMessage(data: unknown, status: number): string {
  if (data && typeof data === 'object') {
    const payload = data as { message?: unknown; error?: unknown };
    if (typeof payload.message === 'string') return payload.message;
    if (typeof payload.error === 'string') return payload.error;
  }

  return `Request failed with status ${status}.`;
}

async function request<TResponse, TBody = unknown>(
  path: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<TResponse> {
  const {
    auth = true,
    body,
    headers: suppliedHeaders,
    query,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal: suppliedSignal,
    ...fetchOptions
  } = options;
  const url = buildUrl(path, query);
  const headers = new Headers(suppliedHeaders);
  headers.set('Accept', 'application/json');

  if (auth) {
    const token = await AsyncStorage.getItem('authToken');
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const controller = new AbortController();
  const forwardAbort = () => controller.abort();
  suppliedSignal?.addEventListener('abort', forwardAbort);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      body: prepareBody(body, headers),
      signal: controller.signal,
    });
    const data = await parseResponse(response);

    if (!response.ok) {
      throw new ApiError(getErrorMessage(data, response.status), {
        status: response.status,
        url,
        data,
      });
    }

    return data as TResponse;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    const timedOut = controller.signal.aborted && !suppliedSignal?.aborted;
    throw new ApiError(timedOut ? 'The request timed out.' : 'Unable to reach the server.', {
      status: 0,
      url,
      cause: error,
    });
  } finally {
    clearTimeout(timeout);
    suppliedSignal?.removeEventListener('abort', forwardAbort);
  }
}

export const apiClient = {
  request,
  get: <TResponse>(path: string, options?: ApiRequestOptions) =>
    request<TResponse>(path, { ...options, method: 'GET' }),
  post: <TResponse, TBody = unknown>(path: string, body?: TBody, options?: ApiRequestOptions<TBody>) =>
    request<TResponse, TBody>(path, { ...options, method: 'POST', body }),
  put: <TResponse, TBody = unknown>(path: string, body?: TBody, options?: ApiRequestOptions<TBody>) =>
    request<TResponse, TBody>(path, { ...options, method: 'PUT', body }),
  patch: <TResponse, TBody = unknown>(path: string, body?: TBody, options?: ApiRequestOptions<TBody>) =>
    request<TResponse, TBody>(path, { ...options, method: 'PATCH', body }),
  delete: <TResponse>(path: string, options?: ApiRequestOptions) =>
    request<TResponse>(path, { ...options, method: 'DELETE' }),
};
