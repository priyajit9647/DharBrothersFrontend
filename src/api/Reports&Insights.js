import { authorizedFetch, authorizedFetchRaw } from './auth';

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === '') return;

    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)));
    } else {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

/**
 * Fetch delayed jobs report.
 * Endpoint: GET /api/v1/admin/reports/delayed-jobs
 * @param {{branchId?: number|string, page?: number, size?: number, sort?: string|Array<string>}} params
 * @returns {Promise<{items:Array, total:number, page:number, size:number, raw: any}>}
 */
export async function getDelayedJobs(params = {}) {
  const { branchId, page = 0, size = 10, sort } = params;

  const qs = buildQueryString({ branchId, page, size, sort });
  const url = `/api/v1/admin/reports/delayed-jobs${qs}`;

  const response = await authorizedFetch(url, { method: 'GET' });

  const items = Array.isArray(response)
    ? response
    : response?.items ?? response?.data ?? response?.content ?? response?.list ?? [];

  const total = Number(
    response?.totalElements ?? response?.total ?? response?.totalItems ?? response?.totalCount ?? items.length
  );

  const currentPage = Number(response?.page ?? response?.pageNumber ?? page ?? 0);
  const pageSize = Number(response?.size ?? size);

  return { items, total, page: currentPage, size: pageSize, raw: response };
}

// Placeholders for other reports to be implemented later
export async function getOpenJobsReport(params = {}) {
  // Endpoint: GET /api/v1/admin/reports/open-jobs
  const { branchId, page = 0, size = 10, sort } = params;

  const qs = buildQueryString({ branchId, page, size, sort });
  const url = `/api/v1/admin/reports/open-jobs${qs}`;

  const response = await authorizedFetch(url, { method: 'GET' });

  const items = Array.isArray(response)
    ? response
    : response?.items ?? response?.data ?? response?.content ?? response?.list ?? [];

  const total = Number(
    response?.totalElements ?? response?.total ?? response?.totalItems ?? response?.totalCount ?? items.length
  );

  const currentPage = Number(response?.page ?? response?.pageNumber ?? page ?? 0);
  const pageSize = Number(response?.size ?? size);

  return { items, total, page: currentPage, size: pageSize, raw: response };
}

export async function getReadyToDispatchReport(params = {}) {
  // Endpoint: GET /api/v1/admin/reports/ready-for-dispatch
  const { branchId, page = 0, size = 10, sort } = params;

  const qs = buildQueryString({ branchId, page, size, sort });
  const url = `/api/v1/admin/reports/ready-for-dispatch${qs}`;

  const response = await authorizedFetch(url, { method: 'GET' });

  const items = Array.isArray(response)
    ? response
    : response?.items ?? response?.data ?? response?.content ?? response?.list ?? [];

  const total = Number(
    response?.totalElements ?? response?.total ?? response?.totalItems ?? response?.totalCount ?? items.length
  );

  const currentPage = Number(response?.page ?? response?.pageNumber ?? page ?? 0);
  const pageSize = Number(response?.size ?? size);

  return { items, total, page: currentPage, size: pageSize, raw: response };
}

/**
 * Export delayed jobs report as a file (csv|xlsx supported via `format` param).
 * Endpoint: GET /api/v1/admin/reports/delayed-jobs/export
 */
export async function exportDelayedJobs(params = {}) {
  const qs = buildQueryString(params);
  const url = `/api/v1/admin/reports/delayed-jobs/export${qs}`;

  const response = await authorizedFetchRaw(url, { method: 'GET' });
  return response;
}

/**
 * Export ready-to-dispatch report as a file (csv|xlsx supported via `format` param).
 * Endpoint: GET /api/v1/admin/reports/ready-for-dispatch/export
 */
export async function exportReadyToDispatch(params = {}) {
  const qs = buildQueryString(params);
  const url = `/api/v1/admin/reports/ready-for-dispatch/export${qs}`;

  const response = await authorizedFetchRaw(url, { method: 'GET' });
  return response;
}

/**
 * Export open jobs report as a file (csv|xlsx supported via `format` param).
 * Endpoint: GET /api/v1/admin/reports/open-jobs/export
 */
export async function exportOpenJobs(params = {}) {
  const qs = buildQueryString(params);
  const url = `/api/v1/admin/reports/open-jobs/export${qs}`;

  const response = await authorizedFetchRaw(url, { method: 'GET' });
  return response;
}

/**
 * Fetch today's due tasks.
 * Endpoint: GET /api/v1/admin/task-list/today-due-tasks
 * @param {{branchId?: number|string, processStageId?: number|string, page?: number, size?: number, sort?: string|Array<string>}} params
 * @returns {Promise<{items:Array, total:number, page:number, size:number, raw: any}>}
 */
export async function getTodayDueTasks(params = {}) {
  const { branchId, processStageId, page = 0, size = 10, sort } = params;

  const qs = buildQueryString({ branchId, processStageId, page, size, sort });
  const url = `/api/v1/admin/task-list/today-due-tasks${qs}`;

  const response = await authorizedFetch(url, { method: 'GET' });

  const items = Array.isArray(response)
    ? response
    : response?.content ?? response?.items ?? response?.data ?? response?.list ?? [];

  const total = Number(
    response?.totalElements ?? response?.total ?? response?.totalItems ?? response?.totalCount ?? items.length
  );

  const currentPage = Number(response?.number ?? response?.pageNumber ?? page ?? 0);
  const pageSize = Number(response?.size ?? size);

  return { items, total, page: currentPage, size: pageSize, raw: response };
}

export async function getCompleteJobsReport(params = {}) {
  // Endpoint: GET /api/v1/admin/reports/completed-jobs
  const { branchId, page = 0, size = 10, sort } = params;

  const qs = buildQueryString({ branchId, page, size, sort });
  const url = `/api/v1/admin/reports/completed-jobs${qs}`;

  const response = await authorizedFetch(url, { method: 'GET' });

  const items = Array.isArray(response)
    ? response
    : response?.items ?? response?.data ?? response?.content ?? response?.list ?? [];

  const total = Number(
    response?.totalElements ?? response?.total ?? response?.totalItems ?? response?.totalCount ?? items.length
  );

  const currentPage = Number(response?.page ?? response?.pageNumber ?? page ?? 0);
  const pageSize = Number(response?.size ?? size);

  return { items, total, page: currentPage, size: pageSize, raw: response };
}

/**
 * Export completed jobs report as a file (csv|xlsx supported via `format` param).
 * Endpoint: GET /api/v1/admin/reports/completed-jobs/export
 */
export async function exportCompleteJobs(params = {}) {
  const qs = buildQueryString(params);
  const url = `/api/v1/admin/reports/completed-jobs/export${qs}`;

  const response = await authorizedFetchRaw(url, { method: 'GET' });
  return response;
}

/**
 * Fetch sales report.
 * Endpoint: GET /api/v1/report/sales
 * Supports pagination and common filters (fromDate, toDate, state, customerId, orderNumber, search)
 */
export async function getSalesReport(params = {}) {
  const { page = 0, size = 10, sort } = params;

  const qs = buildQueryString(params);
  const url = `/api/v1/report/sales${qs}`;

  const response = await authorizedFetch(url, { method: 'GET' });

  const items = Array.isArray(response)
    ? response
    : response?.content ?? response?.items ?? response?.data ?? response?.list ?? [];

  const total = Number(
    response?.totalElements ?? response?.total ?? response?.totalItems ?? response?.totalCount ?? items.length
  );

  const currentPage = Number(response?.number ?? response?.pageNumber ?? page ?? 0);
  const pageSize = Number(response?.size ?? size);

  return { items, total, page: currentPage, size: pageSize, raw: response };
}

/**
 * Export sales report as a file.
 * Endpoint: GET /api/v1/report/sales/export
 * Accepts same filters as getSalesReport and an optional `format` param (csv|xlsx).
 * Returns the raw Response so callers can stream/download the file blob.
 */
export async function exportSalesReport(params = {}) {
  const qs = buildQueryString(params);
  const url = `/api/v1/report/sales/export${qs}`;

  const response = await authorizedFetchRaw(url, { method: 'GET' });
  return response;
}

/**
 * Fetch GST reports from CA data endpoint.
 * Endpoint: GET /api/ca-data/report
 * Supports filters: startDate, endDate, branch, gstType, search, page, size, sort
 */
export async function getGstReport(params = {}) {
  const { startDate, endDate, branch, gstType, search, page = 0, size = 10, sort } = params;

  const qs = buildQueryString({ startDate, endDate, branch, gstType, search, page, size, sort });
  const url = `/api/ca-data/report${qs}`;

  const response = await authorizedFetch(url, { method: 'GET' });

  const items = Array.isArray(response)
    ? response
    : response?.items ?? response?.data ?? response?.content ?? response?.list ?? [];

  const total = Number(
    response?.totalElements ?? response?.total ?? response?.totalItems ?? response?.totalCount ?? items.length
  );

  const currentPage = Number(response?.page ?? response?.pageNumber ?? page ?? 0);
  const pageSize = Number(response?.size ?? size);

  return { items, total, page: currentPage, size: pageSize, raw: response };
}
