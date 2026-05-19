import { authorizedFetch } from './auth';

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
  // Endpoint: /api/v1/admin/reports/ready-to-dispatch (TBD)
  return { items: [], total: 0, page: 0, size: 0, raw: null };
}

export async function getCompleteJobsReport(params = {}) {
  // Endpoint: /api/v1/admin/reports/completed-jobs (TBD)
  return { items: [], total: 0, page: 0, size: 0, raw: null };
}
