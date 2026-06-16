import { authorizedFetch } from './auth';

// ==============================|| PAYMENT CONFIGURATION API ||============================== //

export async function getPaymentConfigurations(branchId) {
  // eslint-disable-next-line no-console
  console.log(`Calling GET /api/v1/payment/config/list?branchId=${branchId}`);

  return authorizedFetch(`/api/v1/payment/config/list?branchId=${encodeURIComponent(branchId)}`, {
    method: 'GET'
  });
}

export async function createPaymentConfiguration(payload = {}) {
  // eslint-disable-next-line no-console
  console.log('Calling POST /api/v1/payment/config/create', {
    ...payload,
    // do not log binary file content
    sealImageFile: payload.sealImageFile ? '[File]' : undefined
  });

  const form = new FormData();

  const fields = [
    'id',
    'branchId',
    'bankName',
    'accountHolderName',
    'accountNumber',
    'ifscCode',
    'branchName',
    'bankBranch',
    'merchantId',
    'aggregatorId',
    'secretKey',
    'baseUrl',
    'percentage',
    'active',
    'createdBy',
    'createdDate',
    'modifiedBy',
    'modifiedDate',
    'sealImagePath',
    'sealImageName',
    'sealUploaded'
  ];

  fields.forEach((f) => {
    const v = payload[f];
    if (typeof v !== 'undefined' && v !== null) {
      // convert boolean/number/date to string for FormData
      if (v instanceof Date) form.append(f, v.toISOString());
      else form.append(f, String(v));
    }
  });

  // Optional file field for seal image. Expect caller to provide `sealImageFile` (File or Blob).
  if (payload.sealImageFile) {
    form.append('sealImage', payload.sealImageFile);
  }

  return authorizedFetch('/api/v1/payment/config/create', {
    method: 'POST',
    body: form
  });
}

export async function editPaymentConfiguration(id, payload = {}) {
  // eslint-disable-next-line no-console
  console.log(`Calling PUT /api/v1/payment/config/edit/${id}`, { id, ...payload, sealImageFile: payload.sealImageFile ? '[File]' : undefined });

  const form = new FormData();

  const fields = [
    'id',
    'branchId',
    'bankName',
    'accountHolderName',
    'accountNumber',
    'ifscCode',
    'branchName',
    'bankBranch',
    'merchantId',
    'aggregatorId',
    'secretKey',
    'baseUrl',
    'percentage',
    'active',
    'createdBy',
    'createdDate',
    'modifiedBy',
    'modifiedDate',
    'sealImagePath',
    'sealImageName',
    'sealUploaded'
  ];

  fields.forEach((f) => {
    const v = payload[f] ?? (f === 'id' ? id : undefined);
    if (typeof v !== 'undefined' && v !== null) {
      if (v instanceof Date) form.append(f, v.toISOString());
      else form.append(f, String(v));
    }
  });

  if (payload.sealImageFile) {
    form.append('sealImage', payload.sealImageFile);
  }

  return authorizedFetch(`/api/v1/payment/config/edit/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: form
  });
}
