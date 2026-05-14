import { authorizedFetch } from './auth';
import { getRecentOrders } from './orders';

function normalizeAnalyticsResponse(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.list)) return payload.list;

  if (Array.isArray(payload?.series) && Array.isArray(payload?.labels)) {
    return payload.labels.map((label, index) => ({
      label,
      value: payload.series[index]?.data?.[0] ?? payload.series[index]?.value ?? payload.series[index] ?? 0
    }));
  }

  if (Array.isArray(payload?.labels) && Array.isArray(payload?.values)) {
    return payload.labels.map((label, index) => ({
      label,
      value: payload.values[index] ?? 0
    }));
  }

  if (payload && typeof payload === 'object') {
    return Object.entries(payload)
      .filter(([, value]) => typeof value === 'number' || typeof value === 'string')
      .map(([label, value]) => ({
        label,
        value
      }));
  }

  return [];
}

function normalizeKpiValue(value) {
  if (value == null || value === '') return null;

  if (typeof value === 'number') return value;

  const numericValue = Number(String(value).replace(/,/g, ''));
  return Number.isNaN(numericValue) ? String(value) : numericValue;
}

function normalizeKpiItem(item = {}, fallbackKey = '') {
  const key = String(item.key ?? item.code ?? item.name ?? item.label ?? fallbackKey).trim();
  const title = String(item.title ?? item.label ?? item.name ?? item.metric ?? key).trim();

  return {
    key,
    title,
    count: normalizeKpiValue(item.count ?? item.value ?? item.total ?? item.amount ?? item.jobs ?? item.number ?? item.metricValue),
    percentage: normalizeKpiValue(item.percentage ?? item.percent ?? item.changePercent ?? item.growth ?? item.rate),
    isLoss: Boolean(item.isLoss ?? item.loss ?? item.decrease),
    extra: String(item.extra ?? item.subtitle ?? item.description ?? item.note ?? '').trim(),
    color: item.color,
    order: Number(item.order ?? item.index ?? 0)
  };
}

function normalizeDashboardKpiResponse(payload) {
  if (!payload) {
    return [];
  }

  const source = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.content)
          ? payload.content
          : Array.isArray(payload?.list)
            ? payload.list
            : null;

  if (source) {
    return source.map((item, index) => normalizeKpiItem(item, `kpi-${index + 1}`));
  }

  if (typeof payload === 'object') {
    return Object.entries(payload)
      .filter(([, value]) => typeof value === 'number' || typeof value === 'string' || (value && typeof value === 'object'))
      .map(([key, value], index) => {
        const item = value && typeof value === 'object' ? value : { value };
        return normalizeKpiItem({ ...item, key, label: item.label ?? key, title: item.title ?? key, order: item.order ?? index }, key);
      });
  }

  return [];
}

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === '') {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

function normalizeHeatmapRecord(item = {}, fallbackLabel = '') {
  const label = String(item.label ?? item.area ?? item.city ?? item.pincode ?? item.name ?? fallbackLabel).trim();
  const volumeValue = item.volume ?? item.orders ?? item.count ?? item.totalOrders ?? item.total ?? item.value ?? 0;
  const volume = Number(volumeValue);

  return {
    label,
    volume: Number.isFinite(volume) ? volume : 0
  };
}

function normalizeHeatmapResponse(payload) {
  const safeData = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.content)
          ? payload.content
          : Array.isArray(payload?.list)
            ? payload.list
            : [];

  return safeData.map((item, index) => normalizeHeatmapRecord(item, `Item ${index + 1}`)).filter((item) => item.label);
}

/**
 * Fetch throughput analytics for the dashboard.
 * Endpoint: /api/v1/dashboard/analytics/throughput
 * @param {{branchId?: number|string, days?: number}} params
 * @returns {Promise<Array<{label:string, value:number|string}>>}
 */
export async function getThroughputAnalytics(params = {}) {
  const { branchId, days = 7 } = params;

  const queryString = buildQueryString({
    branchId,
    days
  });

  const response = await authorizedFetch(`/api/v1/dashboard/analytics/throughput${queryString}`, {
    method: 'GET'
  });

  return normalizeAnalyticsResponse(response);
}

/**
 * Fetch dashboard KPI metrics.
 * Endpoint: /api/v1/dashboard/analytics/kpi
 * @param {{branchId?: number|string, fromDate?: string, toDate?: string}} params
 * @returns {Promise<Array<{key:string,title:string,count:number|string|null,percentage:number|string|null,isLoss:boolean,extra:string,color?:string,order:number}>>}
 */
export async function getDashboardKpis(params = {}) {
  const { branchId, fromDate, toDate } = params;

  const queryString = new URLSearchParams(
    Object.entries({ branchId, fromDate, toDate }).reduce((accumulator, [key, value]) => {
      if (value != null && value !== '') {
        accumulator[key] = String(value);
      }
      return accumulator;
    }, {})
  ).toString();

  const response = await authorizedFetch(`/api/v1/dashboard/analytics/kpi${queryString ? `?${queryString}` : ''}`, {
    method: 'GET'
  });

  return normalizeDashboardKpiResponse(response).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * Fetch order density data for the dashboard.
 * Endpoint: /api/v1/dashboard/analytics/order-density
 * @param {{branchId?: number|string, fromDate?: string, toDate?: string}} params
 * @returns {Promise<{pincodes:Array<{area:string,orders:number}>, cities:Array<{area:string,orders:number}>}>}
 */
export async function getOrderDensity(params = {}) {
  const { branchId, fromDate, toDate } = params;

  const query = new URLSearchParams();
  if (branchId != null && branchId !== '') query.set('branchId', String(branchId));
  if (fromDate) query.set('fromDate', String(fromDate));
  if (toDate) query.set('toDate', String(toDate));

  const url = `/api/v1/dashboard/analytics/order-density${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await authorizedFetch(url, { method: 'GET' });

  // Defensive normalization: accept multiple shapes
  // Preferred shape: { pincodes: [{ area, orders }], cities: [{ area, orders }] }
  if (!response) return { pincodes: [], cities: [] };

  if (Array.isArray(response)) {
    // assume array of pincodes
    return {
      pincodes: response.map((it) => ({
        area: it.area ?? it.pincode ?? String(it.key ?? ''),
        orders: Number(it.orders ?? it.value ?? it.count ?? 0)
      })),
      cities: []
    };
  }

  if (typeof response === 'object') {
    const pincodes = Array.isArray(response.pincodes)
      ? response.pincodes.map((it) => ({
          area: it.area ?? it.pincode ?? String(it.key ?? ''),
          orders: Number(it.orders ?? it.value ?? it.count ?? 0)
        }))
      : Array.isArray(response.pincode)
        ? response.pincode.map((it) => ({
            area: it.area ?? it.pincode ?? String(it.key ?? ''),
            orders: Number(it.orders ?? it.value ?? it.count ?? 0)
          }))
        : [];

    const cities = Array.isArray(response.cities)
      ? response.cities.map((it) => ({
          area: it.area ?? it.city ?? String(it.key ?? ''),
          orders: Number(it.orders ?? it.value ?? it.count ?? 0)
        }))
      : Array.isArray(response.city)
        ? response.city.map((it) => ({
            area: it.area ?? it.city ?? String(it.key ?? ''),
            orders: Number(it.orders ?? it.value ?? it.count ?? 0)
          }))
        : [];

    // If the response uses keys as object map { '700001': 184, '700012': 151 }
    if (pincodes.length === 0 && response.pincode && typeof response.pincode === 'object' && !Array.isArray(response.pincode)) {
      Object.entries(response.pincode).forEach(([k, v]) => pincodes.push({ area: String(k), orders: Number(v ?? 0) }));
    }

    if (cities.length === 0 && response.city && typeof response.city === 'object' && !Array.isArray(response.city)) {
      Object.entries(response.city).forEach(([k, v]) => cities.push({ area: String(k), orders: Number(v ?? 0) }));
    }

    return { pincodes, cities };
  }

  return { pincodes: [], cities: [] };
}

/**
 * Fetch pincode heatmap data (order volume grouped by pincode).
 * Endpoint: /api/v1/dashboard/analytics/pincode-heatmap
 * @param {{branchId?: number|string, fromDate?: string, toDate?: string, limit?: number}} params
 * @returns {Promise<Array<{area:string,orders:number}>>}
 */
export async function getPincodeHeatmap(params = {}) {
  const { branchId, fromDate, toDate, limit = 10 } = params;

  const query = new URLSearchParams();
  if (branchId != null && branchId !== '') query.set('branchId', String(branchId));
  if (fromDate) query.set('fromDate', String(fromDate));
  if (toDate) query.set('toDate', String(toDate));
  if (limit != null) query.set('limit', String(limit));

  const url = `/api/v1/dashboard/analytics/pincode-heatmap${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await authorizedFetch(url, { method: 'GET' });
  console.log('Heatmap API Response:', response);

  return normalizeHeatmapResponse(response);
}

/**
 * Fetch city heatmap data (order volume grouped by city).
 * Endpoint: /api/v1/dashboard/analytics/city-heatmap
 * @param {{branchId?: number|string, fromDate?: string, toDate?: string, limit?: number}} params
 * @returns {Promise<Array<{area:string,orders:number}>>}
 */
export async function getCityHeatmap(params = {}) {
  const { branchId, fromDate, toDate, limit = 10 } = params;

  const query = new URLSearchParams();
  if (branchId != null && branchId !== '') query.set('branchId', String(branchId));
  if (fromDate) query.set('fromDate', String(fromDate));
  if (toDate) query.set('toDate', String(toDate));
  if (limit != null) query.set('limit', String(limit));

  const url = `/api/v1/dashboard/analytics/city-heatmap${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await authorizedFetch(url, { method: 'GET' });
  console.log('Heatmap API Response:', response);

  return normalizeHeatmapResponse(response);
}

function normalizeHeatmapLabel(value) {
  if (value == null) return '';
  return String(value).trim();
}

function extractHeatmapValue(record, keys) {
  for (const key of keys) {
    const value = record?.[key];
    if (value != null && value !== '') {
      return normalizeHeatmapLabel(value);
    }
  }

  return '';
}

function aggregateHeatmapFromOrders(orders, keys, limit) {
  const counts = new Map();

  orders.forEach((order) => {
    const label = extractHeatmapValue(order, keys);
    if (!label) return;

    counts.set(label, (counts.get(label) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([label, volume]) => ({ label, volume }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, limit);
}

/**
 * Build pincode and city heatmap data from recent orders.
 * This is used when a dedicated heatmap endpoint is empty or unavailable.
 * @param {{branchId?: number|string, fromDate?: string, toDate?: string, limit?: number, size?: number}} params
 * @returns {Promise<{pincodes:Array<{area:string,orders:number}>, cities:Array<{area:string,orders:number}>}>}
 */
export async function getOrderHeatmapsFromOrders(params = {}) {
  const { branchId, fromDate, toDate, limit = 10, size = 200 } = params;

  const orders = await getRecentOrders({
    branchId,
    fromDate,
    toDate,
    page: 0,
    size,
    sort: ['createdDate,DESC']
  });

  const source = Array.isArray(orders) ? orders : [];

  return {
    pincodes: aggregateHeatmapFromOrders(source, ['shippingPincode', 'pincode', 'pinCode', 'customerPincode', 'billingPincode'], limit),
    cities: aggregateHeatmapFromOrders(source, ['shippingCity', 'customerCity', 'city', 'billingCity', 'locationCity'], limit)
  };
}
