import { authorizedFetch } from './auth';

// ==============================|| PRINTING RATE MASTER API ||============================== //

export async function getPrintingRates() {
  // Expected response: array of { id, paperId, printColorId, printingColour, firstCopyRate, additionalCopyRate, active }
  // eslint-disable-next-line no-console
  console.log('Calling GET /api/v1/master/billing/printing-rate/list');
  return authorizedFetch('/api/v1/master/billing/printing-rate/list', {
    method: 'GET'
  });
}

export async function createPrintingRate({ paperId, printColorId, printingColour, firstCopyRate, additionalCopyRate, active }) {
  // eslint-disable-next-line no-console
  console.log('Calling POST /api/v1/master/billing/printing-rate/create', {
    paperId,
    printColorId,
    printingColour,
    firstCopyRate,
    additionalCopyRate,
    active
  });
  return authorizedFetch('/api/v1/master/billing/printing-rate/create', {
    method: 'POST',
    body: JSON.stringify({ paperId, printColorId, printingColour, firstCopyRate, additionalCopyRate, active })
  });
}

export async function editPrintingRate(id, { paperId, printColorId, printingColour, firstCopyRate, additionalCopyRate, active }) {
  // eslint-disable-next-line no-console
  console.log(`Calling PUT /api/v1/master/billing/printing-rate/edit/${id}` , {
    paperId,
    printColorId,
    printingColour,
    firstCopyRate,
    additionalCopyRate,
    active
  });
  return authorizedFetch(`/api/v1/master/billing/printing-rate/edit/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ paperId, printColorId, printingColour, firstCopyRate, additionalCopyRate, active })
  });
}

export async function togglePrintingRateActive(id, active) {
  // eslint-disable-next-line no-console
  console.log(`Calling PATCH /api/v1/master/billing/printing-rate/disable/${id}/${active}`);
  return authorizedFetch(`/api/v1/master/billing/printing-rate/disable/${id}/${active}`, {
    method: 'PATCH'
  });
}
