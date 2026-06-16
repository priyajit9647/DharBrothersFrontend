import { useEffect, useMemo, useState } from 'react';

import { CloudUploadOutlined, DeleteOutlined, EnvironmentOutlined, FacebookFilled, InfoCircleOutlined, InstagramOutlined, MailOutlined, PhoneOutlined, TwitterOutlined } from '@ant-design/icons';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

import { publicFetch } from 'api/auth';
import { attachOrder, getOrderEstimation, getOrderPageDetails, uploadTempOrderFiles } from 'api/order';
import Logo from 'components/logo';
import SynopsisStep from './PlaceOrderComponents/SynopsisStep';

const navItems = [
  { label: 'Home', to: '/home' },
  { label: 'About Us', to: '/about' },
  { label: 'What We Do', to: '/what-we-do' },
  { label: 'How We Work', to: '/how-we-work' },
  { label: 'Testimonial', to: '/testimonial' },
  { label: 'Price', to: '/price' },
  { label: 'Faq', to: '/faq' },
  { label: 'Contact Us', to: '/contact' }
];
const socialIcons = [FacebookFilled, TwitterOutlined, InstagramOutlined];

const STEP_DEFINITIONS = {
  upload: { label: 'Upload File', title: 'Upload Documents' },
  details: { label: 'Document Details', title: 'Document Details' },
  hard: { label: 'Hard Binding', title: 'Hard Binding' },
  soft: { label: 'Soft Binding', title: 'Soft Binding' },
  synopsis: { label: 'Synopsis', title: 'Synopsis' },
  summary: { label: 'Order Summary', title: 'Order Summary' },
  checkout: { label: 'Checkout', title: 'Checkout' }
};

const FALLBACK_PAGE_TYPES = [
  { id: 'bw', code: 'BW', name: 'Black & White' },
  { id: 'blank', code: 'BLANK', name: 'Blank' },
  { id: 'color', code: 'COLOR', name: 'Color' }
];

export const SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS = {
  upload_new_design: 'upload_new_design',
  same_as_hard_binding_conver: 'same_as_hard_binding_conver',
  same_as_soft_binding_conver: 'same_as_soft_binding_conver',
  do_not_need_cover_printing: 'do_not_need_cover_printing',
}

async function getWebPageTypes() {
  return publicFetch('/api/v1/web/master/page-types', {
    method: 'GET'
  });
}

async function getWebPapers() {
  return publicFetch('/api/v1/web/master/papers', {
    method: 'GET'
  });
}

async function getWebPaperSizes() {
  return publicFetch('/api/v1/web/master/papers-size', {
    method: 'GET'
  });
}

async function getWebPrintColors() {
  return publicFetch('/api/v1/web/master/print-colors', {
    method: 'GET'
  });
}

async function getWebPrintingTypes() {
  return publicFetch('/api/v1/web/master/printing-types', {
    method: 'GET'
  });
}

async function getWebBindingCoverMaterials() {
  return publicFetch('/api/v1/web/master/binding-cover-material', {
    method: 'GET'
  });
}

async function getWebBranches() {
  return publicFetch('/api/v1/web/master/branches/lookandfeel', {
    method: 'GET'
  });
}

function normalizePageTypeOptions(data) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item, index) => ({
      id: item.id ?? item.pageTypeId ?? `${index + 1}`,
      code: item.code ?? '',
      name: item.name ?? item.label ?? ''
    }))
    .filter((item) => item.id !== undefined && item.id !== null && item.name);
}

function normalizeMasterOptions(data, { labelKeys = ['name', 'displayName'], valueKeys = ['id', 'code', 'name'] } = {}) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item, index) => {
      const label = labelKeys.map((key) => item?.[key]).find(Boolean);
      const value = valueKeys.map((key) => item?.[key]).find(Boolean) ?? `${index + 1}`;

      return {
        label: String(label || value),
        value: String(value),
        code: String(item?.code || ''),
        name: String(item?.name || item?.displayName || '')
      };
    })
    .filter((item) => item.label && item.value);
}

function normalizeBranchOptions(data) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .filter((item) => item?.active !== false)
    .map((item, index) => ({
      label: String(item?.name || item?.code || `Branch ${index + 1}`),
      value: String(item?.id ?? item?.branchId ?? `${index + 1}`),
      address: String(item?.address || ''),
      pincode: String(item?.pincode || '')
    }))
    .filter((item) => item.label && item.value);
}

const INITIAL_CHECKOUT_FORM = {
  mobile: '',
  firstName: '',
  lastName: '',
  customerEmail: '',
  whatsapp: '',
  customerAddress1: '',
  customerCity: '',
  pincode: '',
  landmark: '',
  gst: '',
  universityName: '',
  universityDepartment: '',
  customerAddress2: '',
  country: 'India',
  state: 'West Bengal',
  shippingMode: 'delivery',
  shippingSameAsBilling: true,
  shippingBranchId: '',
  shippingAddress1: '',
  shippingAddress2: '',
  shippingCountry: 'India',
  shippingCity: '',
  shippingState: 'West Bengal',
  shippingPincode: ''
};

function buildCustomerPayloadFromForm(checkoutForm) {
  return {
    firstName: checkoutForm.firstName || '',
    lastName: checkoutForm.lastName || '',
    customerEmail: checkoutForm.customerEmail || '',
    mobile: checkoutForm.mobile || '',
    whatsapp: checkoutForm.whatsapp || checkoutForm.mobile || '',
    customerAddress1: checkoutForm.customerAddress1 || '',
    customerAddress2: checkoutForm.customerAddress2 || '',
    customerCity: checkoutForm.customerCity || '',
    country: checkoutForm.country || '',
    state: checkoutForm.state || '',
    pincode: checkoutForm.pincode || '',
    landmark: checkoutForm.landmark || '',
    universityName: checkoutForm.universityName || ''
  };
}

function buildShippingPayloadFromForm(checkoutForm) {
  const customerWillCollect = checkoutForm.shippingMode === 'pickup';
  const shippingSameAsBilling = !customerWillCollect && checkoutForm.shippingSameAsBilling;
  const shippingAddress1 = shippingSameAsBilling ? checkoutForm.customerAddress1 : checkoutForm.shippingAddress1;
  const shippingAddress2 = shippingSameAsBilling ? checkoutForm.customerAddress2 : checkoutForm.shippingAddress2;
  const shippingCity = shippingSameAsBilling ? checkoutForm.customerCity : checkoutForm.shippingCity;
  const shippingCountry = shippingSameAsBilling ? checkoutForm.country : checkoutForm.shippingCountry;
  const shippingState = shippingSameAsBilling ? checkoutForm.state : checkoutForm.shippingState;
  const shippingPincode = shippingSameAsBilling ? checkoutForm.pincode : checkoutForm.shippingPincode;

  return {
    customerWillCollect,
    shippingSameAsBilling,
    shippingBranchId: customerWillCollect && checkoutForm.shippingBranchId ? Number(checkoutForm.shippingBranchId) : null,
    shippingAddress1: customerWillCollect ? '' : shippingAddress1 || '',
    shippingAddress2: customerWillCollect ? '' : shippingAddress2 || '',
    shippingCountry: customerWillCollect ? '' : shippingCountry || '',
    shippingCity: customerWillCollect ? '' : shippingCity || '',
    shippingState: customerWillCollect ? '' : shippingState || '',
    shippingPincode: customerWillCollect ? '' : shippingPincode || ''
  };
}

function normalizeBindingCoverMaterials(data, bindingType) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .filter((item) => item?.active !== false && `${item?.bindingType || ''}`.toUpperCase() === bindingType)
    .map((item, index) => {
      const code = String(item?.code || item?.name || `Cover ${index + 1}`);
      const name = String(item?.name || item?.code || `Cover ${index + 1}`);

      return {
        id: String(item?.id ?? code ?? index + 1),
        code,
        name,
        design: item?.design ? `data:image/*;base64,${item.design}` : ''
      };
    });
}

function sanitizePaymentRedirectUrl(rawUrl) {
  if (!rawUrl) {
    return '';
  }

  return rawUrl
    .replace(/(\/api\/v1\/payment\/callback)\/[^/?&#]+(?=([/?#&]|$))/gi, '$1')
    .replace(/(%2Fapi%2Fv1%2Fpayment%2Fcallback)%2F[^%?#&]+(?=(%2F|%3F|%26|%23|$))/gi, '$1');
}

function matchesPageType(pageType, values) {
  const name = `${pageType?.name || ''}`.toLowerCase();
  const code = `${pageType?.code || ''}`.toLowerCase();

  return values.some((value) => name.includes(value) || code.includes(value));
}

function isColourPageType(pageType) {
  return matchesPageType(pageType, ['color', 'colour']);
}

function isBwPageType(pageType) {
  return matchesPageType(pageType, ['black', 'white', 'bw', 'b/w']);
}

function getDefaultPageTypeId(pageTypes) {
  const bwPageType = pageTypes.find((item) => isBwPageType(item));
  return String((bwPageType || pageTypes[0] || FALLBACK_PAGE_TYPES[0]).id);
}

function buildPageRows(pageTypes, count = 1) {
  const defaultPageTypeId = getDefaultPageTypeId(pageTypes);

  return Array.from({ length: count }, (_, index) => ({
    pageNumber: index + 1,
    pageTypeId: defaultPageTypeId
  }));
}

function sanitizePageRows(rows, pageTypes) {
  const validIds = new Set(pageTypes.map((item) => String(item.id)));
  const defaultPageTypeId = getDefaultPageTypeId(pageTypes);

  if (!rows.length) {
    return buildPageRows(pageTypes, 1);
  }

  return rows.map((row, index) => ({
    pageNumber: index + 1,
    pageTypeId: validIds.has(String(row.pageTypeId)) ? String(row.pageTypeId) : defaultPageTypeId
  }));
}

function normalizePageDetails(pageDetails, pageTypes) {
  const pageMap = pageDetails?.pageAndPageTypeIdMap;
  const normalizedEntries = pageMap && typeof pageMap === 'object' ? Object.entries(pageMap) : [];

  if (!normalizedEntries.length) {
    return buildPageRows(pageTypes, Math.max(Number(pageDetails?.totalPages) || 1, 1));
  }

  return sanitizePageRows(
    normalizedEntries
      .map(([pageNumber, pageTypeId]) => ({
        pageNumber: Number(pageNumber),
        pageTypeId: String(pageTypeId)
      }))
      .filter((row) => Number.isFinite(row.pageNumber) && row.pageNumber > 0)
      .sort((first, second) => first.pageNumber - second.pageNumber),
    pageTypes
  );
}

export default function PlaceOrder({ pageTitle = 'Order Thesis Online', hideHeader = false, hideOrderButton = false, hideHero = false, hideFooter = false }) {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [thesisDocument, setThesisDocument] = useState(null);
  const [synopsisDocument, setSynopsisDocument] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [orderSummary, setOrderSummary] = useState(null);
  const [pageTypeOptions, setPageTypeOptions] = useState([]);
  const [pageTypesLoading, setPageTypesLoading] = useState(false);
  const [pageTypesError, setPageTypesError] = useState('');
  const [pageRows, setPageRows] = useState([]);
  const [pageEditorOpen, setPageEditorOpen] = useState(false);
  const [synopsisPageRows, setSynopsisPageRows] = useState([]);
  const [synopsisPageEditorOpen, setSynopsisPageEditorOpen] = useState(false);
  const [pageDetailsLoading, setPageDetailsLoading] = useState(false);
  const [selectedBindings, setSelectedBindings] = useState({ hard: false, soft: false });
  const [checkoutForm, setCheckoutForm] = useState(INITIAL_CHECKOUT_FORM);
  const [checkoutError, setCheckoutError] = useState('');
  const [bindingSelectionError, setBindingSelectionError] = useState('');
  const [bindingMasterOptions, setBindingMasterOptions] = useState({
    paperSizes: [],
    papers: [],
    printColors: [],
    printingTypes: []
  });
  const [branchOptions, setBranchOptions] = useState([]);
  const [branchLoading, setBranchLoading] = useState(false);
  const [branchError, setBranchError] = useState('');
  const [hardBindingCoverMaterials, setHardBindingCoverMaterials] = useState([]);
  const [softBindingCoverMaterials, setSoftBindingCoverMaterials] = useState([]);
  const [bindingMasterError, setBindingMasterError] = useState('');
  const [hardBindingConfig, setHardBindingConfig] = useState(() => createBindingConfiguration());
  const [softBindingConfig, setSoftBindingConfig] = useState(() => createBindingConfiguration());
  const [synopsisBindingConfig, setSynopsisBindingConfig] = useState(() => createBindingConfiguration());
  const [synopsisCoverPageType, setSynopsisCoverPageType] = useState(null);
  const [synopsisCoverPageDesignFile, setSynopsisCoverPageDesignFile] = useState(null);

  const activeStepKeys = useMemo(() => {
    const bindingSteps = [];

    if (selectedBindings.hard) {
      bindingSteps.push('hard');
    }

    if (selectedBindings.soft) {
      bindingSteps.push('soft');
    }

    if(synopsisDocument != null) {
      bindingSteps.push('synopsis');
    }

    return ['upload', 'details', ...bindingSteps, 'summary', 'checkout'];
  }, [selectedBindings, synopsisDocument]);
  const currentStepKey = activeStepKeys[activeStep] || 'upload';
  const stepLabels = useMemo(() => activeStepKeys.map((key) => STEP_DEFINITIONS[key].label), [activeStepKeys]);
  const stepGroupIndex = activeStep;
  const pageTypeMap = useMemo(() => new Map(pageTypeOptions.map((item) => [String(item.id), item])), [pageTypeOptions]);
  const pageStats = useMemo(() => {
    const totalPages = pageRows.length;
    const colourPages = pageRows.filter((row) => isColourPageType(pageTypeMap.get(String(row.pageTypeId)))).length;
    const bwPages = pageRows.filter((row) => isBwPageType(pageTypeMap.get(String(row.pageTypeId)))).length;

    return [
      { label: 'Total page', value: totalPages },
      { label: 'Color page', value: colourPages },
      { label: 'BW page', value: bwPages }
    ];
  }, [pageRows, pageTypeMap]);

  const synopsisPageStats = useMemo(() => {
    const totalPages = synopsisPageRows.length;
    const colourPages = synopsisPageRows.filter((row) => isColourPageType(pageTypeMap.get(String(row.pageTypeId)))).length;
    const bwPages = synopsisPageRows.filter((row) => isBwPageType(pageTypeMap.get(String(row.pageTypeId)))).length;

    return [
      { label: 'Total page', value: totalPages },
      { label: 'Color page', value: colourPages },
      { label: 'BW page', value: bwPages }
    ];
  }, [synopsisPageRows, pageTypeMap]);

  useEffect(() => {
    let ignore = false;

    const loadPageTypeOptions = async () => {
      setPageTypesLoading(true);
      setPageTypesError('');

      try {
        const data = await getWebPageTypes();
        const normalized = normalizePageTypeOptions(data);

        if (!ignore) {
          setPageTypeOptions(normalized.length ? normalized : FALLBACK_PAGE_TYPES);
          if (!normalized.length) {
            setPageTypesError('No page types were returned by the server. Showing fallback options.');
          }
        }
      } catch (error) {
        if (!ignore) {
          setPageTypeOptions(FALLBACK_PAGE_TYPES);
          setPageTypesError(error.message || 'Failed to load page types. Showing fallback options.');
        }
      } finally {
        if (!ignore) {
          setPageTypesLoading(false);
        }
      }
    };

    loadPageTypeOptions();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadBranchOptions = async () => {
      setBranchLoading(true);
      setBranchError('');

      try {
        const data = await getWebBranches();

        if (!ignore) {
          setBranchOptions(normalizeBranchOptions(data));
        }
      } catch (error) {
        if (!ignore) {
          setBranchOptions([]);
          setBranchError(error.message || 'Failed to load branch options.');
        }
      } finally {
        if (!ignore) {
          setBranchLoading(false);
        }
      }
    };

    loadBranchOptions();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadBindingMasterOptions = async () => {
      setBindingMasterError('');

      try {
        const [paperSizes, papers, printColors, printingTypes, bindingCoverMaterials] = await Promise.all([
          getWebPaperSizes(),
          getWebPapers(),
          getWebPrintColors(),
          getWebPrintingTypes(),
          getWebBindingCoverMaterials()
        ]);

        if (!ignore) {
          setBindingMasterOptions({
            paperSizes: normalizeMasterOptions(paperSizes, { labelKeys: ['displayName', 'name', 'code'], valueKeys: ['id', 'code', 'displayName'] }),
            papers: normalizeMasterOptions(papers, { labelKeys: ['name', 'code'], valueKeys: ['id', 'code', 'name'] }),
            printColors: normalizeMasterOptions(printColors, { labelKeys: ['name', 'code'], valueKeys: ['id', 'code', 'name'] }),
            printingTypes: normalizeMasterOptions(printingTypes, { labelKeys: ['name', 'code'], valueKeys: ['id', 'code', 'name'] })
          });
          setHardBindingCoverMaterials(normalizeBindingCoverMaterials(bindingCoverMaterials, 'HARD'));
          setSoftBindingCoverMaterials(normalizeBindingCoverMaterials(bindingCoverMaterials, 'SOFT'));
        }
      } catch (error) {
        if (!ignore) {
          setHardBindingCoverMaterials([]);
          setSoftBindingCoverMaterials([]);
          setBindingMasterError(error.message || 'Failed to load binding dropdown data.');
        }
      }
    };

    loadBindingMasterOptions();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!thesisDocument) {
      setPageRows([]);
      setPageEditorOpen(false);
      return;
    }

    if (!pageTypeOptions.length) {
      return;
    }

    setPageRows((prev) => sanitizePageRows(prev, pageTypeOptions));
  }, [thesisDocument, pageTypeOptions]);

  useEffect(() => {
    if (!synopsisDocument) {
      setSynopsisPageRows([]);
      setSynopsisPageEditorOpen(false);
      return;
    }

    if (!pageTypeOptions.length) {
      return;
    }

    setSynopsisPageRows((prev) => sanitizePageRows(prev, pageTypeOptions));
  }, [synopsisDocument, pageTypeOptions]);

  useEffect(() => {
    setActiveStep((prev) => Math.min(prev, activeStepKeys.length - 1));
  }, [activeStepKeys]);

  const buildTempUploadFormData = () => {
    const payload = new FormData();

    if (thesisDocument) {
      payload.append('thesisDocument', thesisDocument);
    }

    if (synopsisDocument) {
      payload.append('synopsisDocument', synopsisDocument);

      if(synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.upload_new_design) {
        payload.append('synopsisCoverPageDesignFile', synopsisCoverPageDesignFile);
      }
    }

    if (selectedBindings.hard && hardBindingConfig.coverDesignFile) {
      payload.append('coverPageDesignFileHard', hardBindingConfig.coverDesignFile);
    }

    if (selectedBindings.soft && softBindingConfig.coverDesignFile) {
      payload.append('coverPageDesignFileSoft', softBindingConfig.coverDesignFile);
    }

    return payload;
  };

  const buildBindingEstimationPayload = (bindingConfig) => ({
    hardBindingCoverMaterialId: bindingConfig.selectedCover ? Number(bindingConfig.selectedCover) : null,
    coverPageDesign: bindingConfig.coverDesignMode === 'same',
    spinePrintingRequired: bindingConfig.spinePrinting === 'required',
    topContentArea: bindingConfig.spinePrinting === 'required' ? bindingConfig.spineContent.top || '' : '',
    middleContentArea: bindingConfig.spinePrinting === 'required' ? bindingConfig.spineContent.middle || '' : '',
    bottomContentArea: bindingConfig.spinePrinting === 'required' ? bindingConfig.spineContent.bottom || '' : '',
    bindingList: bindingConfig.printDetails.map((detail) => ({
      paperSizeId: detail.paperSize ? Number(detail.paperSize) : null,
      noOfCopies: Number(detail.copies || 0),
      paperId: detail.paper ? Number(detail.paper) : null,
      printColourId: detail.printingColour ? Number(detail.printingColour) : null,
      printingTypeId: detail.printingType ? Number(detail.printingType) : null,
      additionalInformation: detail.additionalInformation || '',
      a4Pockets: Number(detail.a4Pockets || 0),
      cdPockets: Number(detail.cdPockets || 0)
    }))
  });

  const buildOrderEstimationPayload = () => {
    const payload = {
      thesisUploaded: !!thesisDocument,
      totalPages: Number(pageStats[0].value || 0),
      colourPages: Number(pageStats[1].value || 0),
      bWPages: Number(pageStats[2].value || 0),
      bwpages: Number(pageStats[2].value || 0),
      pageAndPageTypeIdMap: pageRows.reduce((accumulator, row) => {
        accumulator[row.pageNumber] = Number(row.pageTypeId);
        return accumulator;
      }, {}),
      synopsisUploaded: !!synopsisDocument,
      synopsisTotalPages: Number(synopsisPageStats[0].value || 0),
      synopsisColourPages: Number(synopsisPageStats[1].value || 0),
      synopsisBWPages: Number(synopsisPageStats[2].value || 0),
      synopsisPageAndPageTypeIdMap: synopsisPageRows.reduce((accumulator, row) => {
        accumulator[row.pageNumber] = Number(row.pageTypeId);
        return accumulator;
      }, {}),
      ...buildCustomerPayloadFromForm(checkoutForm)
    };

    if (selectedBindings.hard) {
      payload.hardBinding = buildBindingEstimationPayload(hardBindingConfig);
    }

    if (selectedBindings.soft) {
      payload.softBinding = buildBindingEstimationPayload(softBindingConfig);
    }

    if(synopsisDocument != null) {
      payload.synopsisBinding = {
        ...buildBindingEstimationPayload(synopsisBindingConfig),
        "coverPageDesign": synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.upload_new_design,
        "sameAsSoftBindingCover": synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.same_as_hard_binding_conver,
        "sameAsHardBindingCover": synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.same_as_soft_binding_conver,
        "coverPrintNotRequired": synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.do_not_need_cover_printing
      };
    }

    return payload;
  };

  const buildCreateOrderPayload = () => ({
    ...buildOrderEstimationPayload(),
    ...buildShippingPayloadFromForm(checkoutForm)
  });

  const shouldLoadEstimationBeforeNext = () => {
    if (currentStepKey === 'hard') {
      return !selectedBindings.soft && synopsisDocument == null;
    }

    if (currentStepKey === 'soft') {
      return synopsisDocument == null;
    }

    return currentStepKey == 'synopsis';
  };

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, activeStepKeys.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleFileChange = (fieldName, file) => {
    if (file && file.type !== 'application/pdf') {
      setUploadError('Please upload PDF files only.');

      if (fieldName === 'thesisDocument') {
        setThesisDocument(null);
      } else {
        setSynopsisDocument(null);
      }

      return;
    }

    setUploadError('');

    if (fieldName === 'thesisDocument') {
      setThesisDocument(file || null);
      setSubmitError('');
      setPageRows([]);
      return;
    }

    setSynopsisDocument(file || null);
    setSubmitError('');
    setSynopsisPageRows([]);
  };

  const handleCheckoutFieldChange = (field, value) => {
    setCheckoutForm((prev) => {
      const next = { ...prev, [field]: value };
      const nextShippingSameAsBilling = field === 'shippingSameAsBilling' ? Boolean(value) : prev.shippingSameAsBilling;
      const nextShippingMode = field === 'shippingMode' ? value : prev.shippingMode;

      if (field === 'mobile' && !prev.whatsapp) {
        next.whatsapp = value;
      }

      if (field === 'shippingMode') {
        if (value === 'pickup') {
          next.shippingSameAsBilling = true;
        } else if (!prev.shippingBranchId) {
          next.shippingBranchId = '';
        }
      }

      if (field === 'shippingSameAsBilling' && value) {
        next.shippingAddress1 = prev.customerAddress1;
        next.shippingAddress2 = prev.customerAddress2;
        next.shippingCity = prev.customerCity;
        next.shippingPincode = prev.pincode;
        next.shippingCountry = prev.country;
        next.shippingState = prev.state;
      }

      if (nextShippingMode === 'delivery' && nextShippingSameAsBilling) {
        if (field === 'customerAddress1') {
          next.shippingAddress1 = value;
        }

        if (field === 'customerAddress2') {
          next.shippingAddress2 = value;
        }

        if (field === 'customerCity') {
          next.shippingCity = value;
        }

        if (field === 'pincode') {
          next.shippingPincode = value;
        }

        if (field === 'country') {
          next.shippingCountry = value;
        }

        if (field === 'state') {
          next.shippingState = value;
        }
      }

      return next;
    });
    setCheckoutError('');
  };

  const validateCheckoutForm = () => {
    if (!checkoutForm.mobile.trim()) {
      setCheckoutError('Please enter phone number.');
      return false;
    }

    if (!checkoutForm.firstName.trim()) {
      setCheckoutError('Please enter first name.');
      return false;
    }

    if (!checkoutForm.customerEmail.trim()) {
      setCheckoutError('Please enter email address.');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutForm.customerEmail.trim())) {
      setCheckoutError('Please enter a valid email address.');
      return false;
    }

    if (!checkoutForm.customerAddress1.trim() || !checkoutForm.customerCity.trim() || !checkoutForm.pincode.trim()) {
      setCheckoutError('Please complete the billing address.');
      return false;
    }

    if (checkoutForm.shippingMode === 'pickup') {
      if (!checkoutForm.shippingBranchId) {
        setCheckoutError('Please select a branch for collection.');
        return false;
      }

      setCheckoutError('');
      return true;
    }

    if (checkoutForm.shippingMode === 'delivery' && !checkoutForm.shippingSameAsBilling) {
      if (!checkoutForm.shippingAddress1.trim() || !checkoutForm.shippingCity.trim() || !checkoutForm.shippingPincode.trim()) {
        setCheckoutError('Please complete the shipping address.');
        return false;
      }
    }

    setCheckoutError('');
    return true;
  };

  const handleToggleBinding = (bindingKey) => {
    setSelectedBindings((prev) => {
      const next = { ...prev, [bindingKey]: !prev[bindingKey] };

      if (next.hard || next.soft) {
        setBindingSelectionError('');
      }

      return next;
    });
  };

  const handleOpenPageEditor = () => {
    if (!thesisDocument) {
      return;
    }

    setPageEditorOpen(true);
  };

  const handleClosePageEditor = () => {
    setPageEditorOpen(false);
  };

  const handlePageTypeChange = (pageNumber, pageTypeId) => {
    setPageRows((prev) => prev.map((row) => (row.pageNumber === pageNumber ? { ...row, pageTypeId: String(pageTypeId) } : row)));
  };

  const handleOpenSynopsisPageEditor = () => {
    if (!synopsisDocument) {
      return;
    }

    setSynopsisPageEditorOpen(true);
  };

  const handleCloseSynopsisPageEditor = () => {
    setSynopsisPageEditorOpen(false);
  };

  const handleSynopsisPageTypeChange = (pageNumber, pageTypeId) => {
    setSynopsisPageRows((prev) => prev.map((row) => (row.pageNumber === pageNumber ? { ...row, pageTypeId: String(pageTypeId) } : row)));
  };

  const handleLoadPageDetails = async () => {
    if (!thesisDocument) {
      setUploadError('Please upload the thesis document.');
      return false;
    }

    setUploadError('');
    setSubmitError('');
    setPageDetailsLoading(true);

    try {
      const payload = new FormData();
      payload.append('thesisDocument', thesisDocument);

      if (synopsisDocument) {
        payload.append('synopsisDocument', synopsisDocument);
      }

      const pageDetails = await getOrderPageDetails(payload);
      const resolvedPageTypes = pageTypeOptions.length ? pageTypeOptions : FALLBACK_PAGE_TYPES;

      setPageRows(normalizePageDetails({
        totalPages: pageDetails?.totalPages,
        pageAndPageTypeIdMap: pageDetails?.pageAndPageTypeIdMap
      }, resolvedPageTypes));

      if (synopsisDocument) {
        setSynopsisPageRows(normalizePageDetails({
          totalPages: pageDetails?.synopsisTotalPages,
          pageAndPageTypeIdMap: pageDetails?.synopsisPageAndPageTypeIdMap
        }, resolvedPageTypes));
      }

      return true;
    } catch (error) {
      setSubmitError(error.message || 'Failed to load page details.');
      return false;
    } finally {
      setPageDetailsLoading(false);
    }
  };

  const loadOrderEstimation = async () => {
    setSummaryLoading(true);
    setSummaryError('');
    setOrderSummary(null);

    try {
      const summary = await getOrderEstimation(buildOrderEstimationPayload());
      setOrderSummary(summary);
      return true;
    } catch (error) {
      setSummaryError(error.message || 'Failed to load order summary.');
      return false;
    } finally {
      setSummaryLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setSubmitError('');
    setSubmitMessage('');
    setSummaryError('');

    if (!thesisDocument) {
      setUploadError('Please upload the thesis document.');
      setActiveStep(0);
      return;
    }

    if (!pageRows.length) {
      setSubmitError('Please configure thesis document pages before placing the order.');
      setActiveStep(1);
      return;
    }

    if (!validateCheckoutForm()) {
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const uploadResponse = await uploadTempOrderFiles(buildTempUploadFormData());
      const tempId = `${uploadResponse?.reason || ''}`.trim();

      if (!tempId) {
        throw new Error('Invalid temp order id received from upload-temp API.');
      }

      const attachResponse = await attachOrder(tempId, buildCreateOrderPayload());
      const paymentUrl = sanitizePaymentRedirectUrl(`${attachResponse?.reason || ''}`.trim());

      if (!paymentUrl) {
        throw new Error('Payment redirect URL was not returned by attach-order API.');
      }

      window.location.assign(paymentUrl);
    } catch (error) {
      setSubmitError(error.message || 'Failed to create order.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handlePrimaryAction = async () => {
    if (currentStepKey === 'checkout') {
      await handlePlaceOrder();
      return;
    }

    if (currentStepKey === 'upload') {
      const loaded = await handleLoadPageDetails();

      if (!loaded) {
        return;
      }
    }

    if (currentStepKey === 'details' && !selectedBindings.hard && !selectedBindings.soft) {
      setBindingSelectionError('Please select at least one binding type.');
      return;
    }

    if (currentStepKey === 'synopsis') {
      if(synopsisCoverPageType == null){
        setBindingSelectionError('Please select synopsis cover page design!');
        return;
      } else if (synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.upload_new_design && synopsisCoverPageDesignFile == null) {
        setBindingSelectionError('Please upload synopsis new design!');
        return;
      }
    }

    if (shouldLoadEstimationBeforeNext()) {
      const loaded = await loadOrderEstimation();

      if (!loaded) {
        return;
      }
    }

    handleNext();
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f7f2' }}>
      {!hideHeader && <TopInfoBar />}
      {!hideHeader && <HeaderNav pageTitle={pageTitle} hideOrderButton={hideOrderButton} />}

      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            sx={{
              overflow: 'hidden',
              borderRadius: 0,
              bgcolor: 'common.white',
              boxShadow: theme.vars.customShadows.z1,
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.12)}`
            }}
          >
            <Box sx={{ px: { xs: 2, md: 6 }, pt: { xs: 3, md: 4 } }}>
              <ProgressHeader activeIndex={stepGroupIndex} stepLabels={stepLabels} />
            </Box>

            <Box sx={{ px: { xs: 2, md: 6 }, pt: { xs: 1, md: 2 }, pb: { xs: 3, md: 4 } }}>
              {currentStepKey === 'upload' && (
                <UploadStep
                  thesisDocument={thesisDocument}
                  synopsisDocument={synopsisDocument}
                  uploadError={uploadError}
                  onFileChange={handleFileChange}
                />
              )}
              {currentStepKey === 'details' && (
                <DocumentDetailsStep
                  thesisDocument={thesisDocument}
                  pageStats={pageStats}
                  pageTypesError={pageTypesError}
                  onEditPageDetails={handleOpenPageEditor}
                  synopsisDocument={synopsisDocument}
                  synopsisPageStats={synopsisPageStats}
                  onEditSynopsisPageDetails={handleOpenSynopsisPageEditor}
                  selectedBindings={selectedBindings}
                  bindingSelectionError={bindingSelectionError}
                  onToggleBinding={handleToggleBinding}
                />
              )}
              {currentStepKey === 'hard' && (
                <HardBindingStep
                  masterOptions={bindingMasterOptions}
                  masterError={bindingMasterError}
                  coverMaterials={hardBindingCoverMaterials}
                  bindingConfig={hardBindingConfig}
                  onBindingConfigChange={setHardBindingConfig}
                />
              )}
              {currentStepKey === 'soft' && (
                <SoftBindingStep
                  masterOptions={bindingMasterOptions}
                  masterError={bindingMasterError}
                  coverMaterials={softBindingCoverMaterials}
                  bindingConfig={softBindingConfig}
                  onBindingConfigChange={setSoftBindingConfig}
                />
              )}
              {currentStepKey === 'synopsis' && (
                <SynopsisStep
                  printTitle="Synopsis Details"
                  coverMaterials={hardBindingCoverMaterials}
                  masterOptions={bindingMasterOptions}
                  masterError={bindingMasterError}
                  a4PocketsLabel="A4 Pockets"
                  cdPocketsLabel="CD Pockets"
                  showCdPockets={false}
                  bindingConfig={synopsisBindingConfig}
                  onBindingConfigChange={setSynopsisBindingConfig}
                  synopsisCoverPageType={synopsisCoverPageType}
                  onChangeSynopsisCoverPageType={setSynopsisCoverPageType}
                  synopsisCoverPageDesignFile={synopsisCoverPageDesignFile}
                  onSynopsisCoverPageDesignFileChange={setSynopsisCoverPageDesignFile}
                  bindingSelectionError={bindingSelectionError}
                  setBindingSelectionError={setBindingSelectionError}
                />
              )}
              {currentStepKey === 'summary' && <OrderSummaryStep summary={orderSummary} loading={summaryLoading} error={summaryError} />}
              {currentStepKey === 'checkout' && (
                <CheckoutStep
                  summary={orderSummary}
                  checkoutForm={checkoutForm}
                  checkoutError={checkoutError}
                  branchOptions={branchOptions}
                  branchLoading={branchLoading}
                  branchError={branchError}
                  onFieldChange={handleCheckoutFieldChange}
                />
              )}

              <Box
                sx={{
                  mt: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box>
                  {activeStep > 0 && (
                    <Button
                      onClick={handleBack}
                      variant="outlined"
                      sx={{
                        minWidth: 110,
                        borderRadius: 0,
                        borderColor: alpha(theme.palette.secondary.main, 0.24),
                        color: 'text.primary'
                      }}
                    >
                      Prev
                    </Button>
                  )}
                </Box>

                <Box>
                  <Button
                    onClick={handlePrimaryAction}
                    variant="contained"
                    disabled={isSubmittingOrder || pageDetailsLoading}
                    sx={{
                      minWidth: 110,
                      borderRadius: 0,
                      bgcolor: theme.palette.warning.lighter,
                      color: theme.palette.text.primary,
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: theme.palette.warning.light,
                        boxShadow: 'none'
                      }
                    }}
                  >
                    {currentStepKey === 'checkout'
                      ? isSubmittingOrder
                        ? 'Submitting...'
                        : 'Make Payment'
                      : currentStepKey === 'summary'
                        ? 'Proceed to Checkout'
                      : currentStepKey === 'upload' && pageDetailsLoading
                        ? 'Loading...'
                        : 'Next'}
                  </Button>
                </Box>
              </Box>

              {submitError ? (
                <Typography color="error" sx={{ mt: 1.5, fontSize: '0.85rem' }}>
                  {submitError}
                </Typography>
              ) : null}

              {submitMessage ? (
                <Typography color="success.main" sx={{ mt: 1.5, fontSize: '0.85rem' }}>
                  {submitMessage}
                </Typography>
              ) : null}
            </Box>
          </Paper>
        </Container>
      </Box>
      <PageEditorDialog
        open={pageEditorOpen}
        loading={pageTypesLoading}
        error={pageTypesError}
        pageRows={pageRows}
        pageTypes={pageTypeOptions}
        onClose={handleClosePageEditor}
        onPageTypeChange={handlePageTypeChange}
        title="Thesis Document Pages"
      />

      <PageEditorDialog
        open={synopsisPageEditorOpen}
        loading={pageTypesLoading}
        error={pageTypesError}
        pageRows={synopsisPageRows}
        pageTypes={pageTypeOptions}
        onClose={handleCloseSynopsisPageEditor}
        onPageTypeChange={handleSynopsisPageTypeChange}
        title="Synopsis Document Pages"
      />

      {!hideFooter && <FooterSection />}
    </Box>
  );
}

export function TopInfoBar() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        bgcolor: 'common.white',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto 1fr' }, alignItems: 'center', py: { xs: 1, md: 1.25 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <HeaderInfo icon={EnvironmentOutlined} text="79, Lenin Sarani Rd, near COMMERCIAL POINT Kolkata, West Bengal 700013" />
            </Box>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            <Stack direction="row" spacing={3} alignItems="center">
              <HeaderInfo icon={PhoneOutlined} text="+ (91) 983 006 6537" />
              <HeaderInfo icon={MailOutlined} text="contactus@dharbrothers.com" />
            </Stack>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', transform: 'translateX(8px)', gap: 0 }}>
              <Typography
                component={RouterLink}
                to="/login"
                sx={{
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  letterSpacing: 0.6,
                  textDecoration: 'none',
                  color: 'text.primary',
                  '&:hover': { color: 'info.main' },
                  display: 'inline-block'
                }}
              >Login</Typography><Box component="span" sx={{ color: 'text.primary', mx: 0, display: 'inline-block' }}>/</Box><Typography
                component={RouterLink}
                to="/customer"
                sx={{
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  letterSpacing: 0.45,
                  textDecoration: 'none',
                  color: 'text.primary',
                  '&:hover': { color: 'info.main' },
                  display: 'inline-block'
                }}
              >Customer Login</Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export function PriceSection({ bindingRates, printingRates, otherCharges }) {
  const theme = useTheme();

  const border = `1px solid ${alpha(theme.palette.secondary.main, 0.25)}`;

  // Group printing rates by paper and categorize into Normal / Royal and BW / Color
  const printingGroupedByPaper = (() => {
    if (!printingRates || !printingRates.length) return [];

    const map = new Map();

    printingRates.forEach((row) => {
      const paperName = String(row.paperName || row.paper || '-');

      const key = paperName;

      if (!map.has(key)) {
        map.set(key, {
          paper: paperName,
          normal_bw: null,
          normal_color: null,
          royal_bw: null,
          royal_color: null
        });
      }

      const entry = map.get(key);

      const label = String(row.printColorName || row.printingColour || '').toLowerCase();
      const isRoyal = label.includes('royal');
      const isColor = label.includes('color') || label.includes('colour') || String(row.printingColour || '').toLowerCase() === 'colour' || String(row.printingColour || '').toLowerCase() === 'coLOUR';

      const target = isRoyal ? (isColor ? 'royal_color' : 'royal_bw') : isColor ? 'normal_color' : 'normal_bw';

      entry[target] = {
        firstCopyRate: row.firstCopyRate ?? row.firstCopyRate ?? '-',
        additionalCopyRate: row.additionalCopyRate ?? row.additionalCopyRate ?? '-',
        label: String(row.printColorName || row.printingColour || '')
      };
    });

    return Array.from(map.values());
  })();

  return (
    <Box sx={{ bgcolor: 'common.white', py: { xs: 5, md: 7 } }}>
      <Container maxWidth="lg">
        {/* Binding Rate Chart */}
        <Typography
          sx={{
            textAlign: 'center',
            fontSize: '1.05rem',
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: 'uppercase',
            mb: 2
          }}
        >
          Binding Rate Chart
        </Typography>

        <Box sx={{ border, borderBottom: 'none', overflowX: 'auto' }}>
          <Box
            component="table"
            sx={{
              width: '100%',
              minWidth: 840,
              borderCollapse: 'collapse',
              '& th, & td': {
                borderRight: border,
                borderBottom: border,
                p: 1,
                fontSize: '0.8rem',
                textAlign: 'center'
              },
              '& tr:last-of-type td': {
                borderBottom: 'none'
              }
            }}
          >
            <Box component="thead">
              <Box component="tr">
                <Box component="th" sx={{ fontWeight: 600 }}>
                  SL.NO
                </Box>
                <Box component="th" sx={{ fontWeight: 600 }}>
                  BINDING TYPE
                </Box>
                <Box component="th" sx={{ fontWeight: 600 }}>
                  MIN COPIES
                </Box>
                <Box component="th" sx={{ fontWeight: 600 }}>
                  MAX COPIES
                </Box>
                <Box component="th" sx={{ fontWeight: 600 }}>
                  RATE
                </Box>
              </Box>
            </Box>

            <Box component="tbody">
              {(bindingRates && bindingRates.length
                ? bindingRates.map((item, index) => ({
                    sl: index + 1,
                    type: (item.bindingType || '').toUpperCase() || '- ',
                    minCopies: item.minCopies ?? '-',
                    maxCopies: item.maxCopies ?? (item.minCopies ? 'Any' : '-'),
                    rate: item.ratePerCopy ?? '-'
                  }))
                : [
                    { sl: 1, type: 'HARD BIND', minCopies: 1, maxCopies: 3, rate: '300' },
                    { sl: 2, type: 'HARD BIND', minCopies: 4, maxCopies: 'Any', rate: '270' },
                    { sl: 3, type: 'SOFT BIND', minCopies: 1, maxCopies: 'Any', rate: '270' },
                    { sl: 4, type: 'SYNOPSIS', minCopies: 1, maxCopies: 'Any', rate: '30' }
                  ]
              ).map((row) => (
                <Box key={row.sl} component="tr" sx={{ bgcolor: 'common.white' }}>
                  <Box component="td">{`${row.sl}.`}</Box>
                  <Box component="td">{row.type}</Box>
                  <Box component="td">{row.minCopies}</Box>
                  <Box component="td">{row.maxCopies}</Box>
                  <Box component="td">{row.rate}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Printing Rate Chart */}
        <Typography
          sx={{
            textAlign: 'center',
            fontSize: '1.05rem',
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: 'uppercase',
            mt: 5,
            mb: 2
          }}
        >
          Printing Rate Chart
        </Typography>

        <Box sx={{ border, overflowX: 'auto' }}>
          {printingRates && printingRates.length ? (
            <Box
              component="table"
              sx={{
                width: '100%',
                minWidth: 1000,
                borderCollapse: 'collapse',
                '& th, & td': {
                  borderRight: border,
                  borderBottom: border,
                  p: 1,
                  fontSize: '0.8rem',
                  textAlign: 'center'
                }
              }}
            >
              <Box component="thead">
                <Box component="tr">
                  <Box component="th" sx={{ fontWeight: 600 }} rowSpan={3}>SL.NO</Box>
                  <Box component="th" sx={{ fontWeight: 600 }} rowSpan={3}>PAPER TYPE &amp; QUALITY</Box>
                  <Box component="th" sx={{ fontWeight: 600 }} colSpan={4}>NORMAL PRINT (BLACK/WHITE &amp; COLOR)</Box>
                  <Box component="th" sx={{ fontWeight: 600, bgcolor: '#fbe463' }} colSpan={4}>ROYAL PRINT (ALL COLOR)</Box>
                </Box>

                <Box component="tr">
                  <Box component="th" sx={{ fontWeight: 600 }} colSpan={2}>BLACK &amp; WHITE</Box>
                  <Box component="th" sx={{ fontWeight: 600 }} colSpan={2}>COLOR</Box>
                  <Box component="th" sx={{ fontWeight: 600, bgcolor: '#fbe463' }} colSpan={2}>BLACK &amp; WHITE</Box>
                  <Box component="th" sx={{ fontWeight: 600, bgcolor: '#fbe463' }} colSpan={2}>COLOR</Box>
                </Box>

                <Box component="tr">
                  {['1ST COPY PER PAGE', 'NEXT COPY PER PAGE'].map((label, i) => (
                    <Box key={`normal-bw-${label}`} component="th" sx={{ fontWeight: 600 }}>
                      {label}
                    </Box>
                  ))}
                  {['1ST COPY PER PAGE', 'NEXT COPY PER PAGE'].map((label, i) => (
                    <Box key={`normal-color-${label}`} component="th" sx={{ fontWeight: 600 }}>
                      {label}
                    </Box>
                  ))}
                  {['1ST COPY PER PAGE', 'NEXT COPY PER PAGE'].map((label, i) => (
                    <Box key={`royal-bw-${label}`} component="th" sx={{ fontWeight: 600, bgcolor: '#fbe463' }}>
                      {label}
                    </Box>
                  ))}
                  {['1ST COPY PER PAGE', 'NEXT COPY PER PAGE'].map((label, i) => (
                    <Box key={`royal-color-${label}`} component="th" sx={{ fontWeight: 600, bgcolor: '#fbe463' }}>
                      {label}
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box component="tbody">
                {printingGroupedByPaper.map((row, idx) => (
                  <Box key={row.paper} component="tr" sx={{ bgcolor: 'common.white' }}>
                    <Box component="td">{`${idx + 1}.`}</Box>
                    <Box component="td" sx={{ textAlign: 'left' }}>{row.paper}</Box>
                    <Box component="td">{row.normal_bw ? row.normal_bw.firstCopyRate : '-'}</Box>
                    <Box component="td">{row.normal_bw ? row.normal_bw.additionalCopyRate : '-'}</Box>
                    <Box component="td">{row.normal_color ? row.normal_color.firstCopyRate : '-'}</Box>
                    <Box component="td">{row.normal_color ? row.normal_color.additionalCopyRate : '-'}</Box>
                    <Box component="td" sx={{ bgcolor: '#fbe463' }}>{row.royal_bw ? row.royal_bw.firstCopyRate : '-'}</Box>
                    <Box component="td" sx={{ bgcolor: '#fbe463' }}>{row.royal_bw ? row.royal_bw.additionalCopyRate : '-'}</Box>
                    <Box component="td" sx={{ bgcolor: '#fbe463' }}>{row.royal_color ? row.royal_color.firstCopyRate : '-'}</Box>
                    <Box component="td" sx={{ bgcolor: '#fbe463' }}>{row.royal_color ? row.royal_color.additionalCopyRate : '-'}</Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            <Box
              component="table"
              sx={{
                width: '100%',
                minWidth: 840,
                borderCollapse: 'collapse',
                '& th, & td': {
                  borderRight: border,
                  borderBottom: border,
                  p: 1,
                  fontSize: '0.78rem',
                  textAlign: 'center'
                },
                '& tr:last-of-type td': {
                  borderBottom: 'none'
                }
              }}
            >
              {/* original complex static table retained as fallback */}
              <Box component="thead">
                <Box component="tr">
                  <Box component="th" sx={{ fontWeight: 600 }} colSpan={2}>
                    PAPER TYPE & QUALITY
                  </Box>
                  <Box component="th" sx={{ fontWeight: 600 }} colSpan={4}>
                    NORMAL PRINT (BLACK/WHITE & COLOR)
                  </Box>
                  <Box component="th" sx={{ fontWeight: 600, bgcolor: '#fbe463' }} colSpan={4}>
                    ROYAL PRINT (ALL COLOR)
                  </Box>
                </Box>

                <Box component="tr">
                  <Box component="th" rowSpan={2} sx={{ fontWeight: 600 }}>
                    SL.NO
                  </Box>
                  <Box component="th" rowSpan={2} sx={{ fontWeight: 600 }}>
                    PAPER TYPE & QUALITY
                  </Box>
                  <Box component="th" sx={{ fontWeight: 600 }} colSpan={2}>
                    BLACK & WHITE
                  </Box>
                  <Box component="th" sx={{ fontWeight: 600 }} colSpan={2}>
                    COLOR
                  </Box>
                  <Box component="th" sx={{ fontWeight: 600, bgcolor: '#fff7c7' }} colSpan={2}>
                    BLACK & WHITE
                  </Box>
                  <Box component="th" sx={{ fontWeight: 600, bgcolor: '#fff7c7' }} colSpan={2}>
                    COLOR
                  </Box>
                </Box>

                <Box component="tr">
                  {['1ST COPY PER PAGE', 'NEXT COPY PER PAGE'].map((label) => (
                    <Box key={`normal-bw-${label}`} component="th" sx={{ fontWeight: 600 }}>
                      {label}
                    </Box>
                  ))}
                  {['1ST COPY PER PAGE', 'NEXT COPY PER PAGE'].map((label) => (
                    <Box key={`normal-color-${label}`} component="th" sx={{ fontWeight: 600 }}>
                      {label}
                    </Box>
                  ))}
                  {['1ST COPY PER PAGE', 'NEXT COPY PER PAGE'].map((label) => (
                    <Box key={`royal-bw-${label}`} component="th" sx={{ fontWeight: 600, bgcolor: '#fff7c7' }}>
                      {label}
                    </Box>
                  ))}
                  {['1ST COPY PER PAGE', 'NEXT COPY PER PAGE'].map((label) => (
                    <Box key={`royal-color-${label}`} component="th" sx={{ fontWeight: 600, bgcolor: '#fff7c7' }}>
                      {label}
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box component="tbody">
                {[
                  {
                    paper: 'Imported Matt 100 GSM or equivalent',
                    values: ['8', '4', '12', '10', '10', '7', '12', '10']
                  },
                  {
                    paper: 'Paper One 100 GSM or equivalent',
                    values: ['6', '2', '10', '8', '8', '5', '10', '8']
                  },
                  {
                    paper: 'Bond Paper 85 GSM or equivalent',
                    values: ['6', '2', '10', '8', '8', '5', '10', '8']
                  },
                  {
                    paper: 'Standard 70/75 GSM or equivalent',
                    values: ['5', '1.5', '10', '8', '6', '4', '10', '8']
                  }
                ].map((row, rowIndex) => (
                  <Box key={row.paper} component="tr" sx={{ bgcolor: 'common.white' }}>
                    <Box component="td">{`${rowIndex + 1}.`}</Box>
                    <Box component="td">{row.paper}</Box>
                    {row.values.map((value, i) => (
                      <Box // eslint-disable-next-line react/no-array-index-key
                        key={i}
                        component="td"
                        sx={{ bgcolor: i >= 4 ? '#fff7c7' : undefined }}
                      >
                        {value}
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Royal Print note */}
        <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 3, mb: 4 }}>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, mb: 0.75 }}>
            **ROYAL PRINT
          </Typography>
          <Typography sx={{ fontSize: '0.86rem', lineHeight: 1.8 }}>
            Royal Print is when both the black &amp; white pages and the color pages are printed from the same color printer to give a
            superior print quality to your document. Highly recommended for people with small color elements throughout their
            documents like a graph or chart to ensure even the smallest details are best captured in the printing process.
          </Typography>
        </Box>

        {/* Others Rate Chart */}
        <Typography
          sx={{
            textAlign: 'center',
            fontSize: '1.05rem',
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: 'uppercase',
            mt: 5,
            mb: 2
          }}
        >
          Others Rate Chart
        </Typography>

        <Box sx={{ border, borderBottom: 'none', overflowX: 'auto', mb: 5 }}>
          <Box
            component="table"
            sx={{
              width: '100%',
              minWidth: 840,
              borderCollapse: 'collapse',
              '& th, & td': {
                borderRight: border,
                borderBottom: border,
                p: 1,
                fontSize: '0.8rem',
                textAlign: 'center'
              },
              '& tr:last-of-type td': {
                borderBottom: 'none'
              }
            }}
          >
            <Box component="thead">
              <Box component="tr">
                <Box component="th" sx={{ fontWeight: 600 }}>
                  SL.NO
                </Box>
                <Box component="th" sx={{ fontWeight: 600 }}>
                  DESCRIPTION
                </Box>
                <Box component="th" sx={{ fontWeight: 600 }}>
                  QUANTITY
                </Box>
                <Box component="th" sx={{ fontWeight: 600 }}>
                  RATE
                </Box>
              </Box>
            </Box>

            <Box component="tbody">
              {(Array.isArray(otherCharges) && otherCharges.length
                ? otherCharges.map((item, idx) => ({
                    sl: idx + 1,
                    desc: item.code || item.description || '-',
                    qty: item.quantityUnit || 'Per copy',
                    rate: item.rate ?? '-'
                  }))
                : [
                    { sl: 1, desc: 'FORMATTING CHARGE (only for WORD file)', qty: 'Per hour', rate: '250' },
                    { sl: 2, desc: 'CD', qty: 'Per copy', rate: '30' }
                  ]).map((row) => (
                <Box key={row.sl} component="tr" sx={{ bgcolor: 'common.white' }}>
                  <Box component="td">{`${row.sl}.`}</Box>
                  <Box component="td">{row.desc}</Box>
                  <Box component="td">{row.qty}</Box>
                  <Box component="td">{row.rate}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Combined Rate Table */}
        <Box sx={{ border, overflowX: 'auto' }}>
          <Box
            component="table"
            sx={{
              width: '100%',
              minWidth: 840,
              borderCollapse: 'collapse',
              '& th, & td': {
                borderRight: border,
                borderBottom: border,
                p: 1,
                fontSize: '0.8rem',
                textAlign: 'center'
              },
              '& tr:last-of-type td': {
                borderBottom: 'none'
              }
            }}
          >
            <Box component="thead">
              <Box component="tr">
                <Box component="th" sx={{ fontWeight: 600 }}>
                  SL.NO
                </Box>
                <Box component="th" sx={{ fontWeight: 600 }}>
                  PAPER TYPE & QUALITY
                </Box>
                <Box component="th" sx={{ fontWeight: 600 }}>
                  PRINTING TYPE
                </Box>
                <Box component="th" sx={{ fontWeight: 600 }}>
                  PRINTING PREFERENCES
                </Box>
                <Box component="th" sx={{ fontWeight: 600 }}>
                  SINGLE SIDE
                </Box>
                <Box component="th" sx={{ fontWeight: 600 }}>
                  BOTH SIDE
                </Box>
              </Box>
            </Box>

            <Box component="tbody">
              {[
                { sl: 1, paper: 'Imported Matt 100 GSM or equivalent', type: 'ALL BW', pref: 'B/W & COLOR / ROYAL PRINT', single: '800', both: '1600' },
                { sl: 2, paper: 'Paper One 100 GSM or equivalent', type: 'ALL BW', pref: 'B/W & COLOR / ROYAL PRINT', single: '1000', both: '2000' },
                { sl: 3, paper: 'Bond Paper 85 GSM or equivalent', type: 'ALL BW', pref: 'B/W & COLOR / ROYAL PRINT', single: '1000', both: '2000' },
                { sl: 4, paper: 'Standard 70-75 GSM or equivalent', type: 'ALL BW', pref: 'B/W & COLOR / ROYAL PRINT', single: '1200', both: '2400' }
              ].map((row) => (
                <Box key={row.sl} component="tr" sx={{ bgcolor: 'common.white' }}>
                  <Box component="td">{`${row.sl}.`}</Box>
                  <Box component="td">{row.paper}</Box>
                  <Box component="td">{row.type}</Box>
                  <Box component="td">{row.pref}</Box>
                  <Box component="td">{row.single}</Box>
                  <Box component="td">{row.both}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function HeaderInfo({ icon: Icon, text }) {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={1.25} alignItems="center">
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          color: theme.palette.info.main,
          border: `1px solid ${alpha(theme.palette.info.main, 0.22)}`,
          flexShrink: 0,
          bgcolor: 'transparent'
        }}
      >
        <Icon style={{ fontSize: 12, color: theme.palette.info.main }} />
      </Box>
      <Typography variant="caption" sx={{ fontSize: '0.76rem', color: 'text.secondary', letterSpacing: 0.15 }}>
        {text}
      </Typography>
    </Stack>
  );
}

export function HeaderNav({ pageTitle = 'Order Thesis Online', hideOrderButton = false }) {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'common.white', position: 'sticky', top: 0, zIndex: 1400 }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            alignItems: 'center',
            gap: 2,
            py: 2.5
          }}
        >
          <Box>
            <Logo to="/" logoHeight={58} />
          </Box>

          <Box component="nav" sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 4, alignItems: 'center' }}>
            {navItems.map((item) => (
              <Typography
                key={item.label}
                component={item.to ? RouterLink : 'span'}
                to={item.to}
                sx={{
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: 'text.primary',
                    cursor: item.to ? 'pointer' : 'default',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    letterSpacing: 0.3,
                    '&:hover': item.to ? { color: 'info.main' } : undefined
                  }}
              >
                {item.label}
              </Typography>
            ))}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            {!hideOrderButton && (
              <Button
                variant="contained"
                component={RouterLink}
                to="/order"
                sx={{
                  px: 4,
                  py: 1.6,
                  borderRadius: 1,
                  bgcolor: '#f5e8a8',
                  color: '#1f2937',
                  boxShadow: 'none',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#f2df7f',
                    boxShadow: 'none'
                  }
                }}
              >
                Order Thesis Online
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function ProgressHeader({ activeIndex, stepLabels }) {
  const theme = useTheme();

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', mb: 3 }}>
      <Box sx={{ position: 'relative', px: { xs: 2, md: 3 }, pb: 1.25 }}>
        <Box
          sx={{
            position: 'absolute',
            top: 7,
            left: 24,
            right: 24,
            height: 2,
            bgcolor: alpha(theme.palette.secondary.main, 0.22)
          }}
        />
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          {stepLabels.map((label, index) => {
            const isActive = index <= activeIndex;

            return (
              <Stack key={label} alignItems="center" spacing={1} sx={{ position: 'relative', zIndex: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: isActive ? theme.palette.info.main : alpha(theme.palette.info.main, 0.38)
                  }}
                />
                <Typography
                  sx={{
                    fontSize: { xs: '0.8rem', md: '0.88rem' },
                    color: isActive ? theme.palette.info.main : 'text.secondary',
                    fontWeight: 500
                  }}
                >
                  {label}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
}

function UploadStep({ thesisDocument, synopsisDocument, uploadError, onFileChange }) {
  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        <Grid container>
          <Grid item xs={12} md={6}>
            <UploadCard
              title="UPLOAD THESIS DOCUMENT"
              fieldName="thesisDocument"
              file={thesisDocument}
              onFileChange={onFileChange}
              errorMessage={uploadError}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ borderLeft: { md: '1px solid' }, borderColor: 'divider' }}>
            <UploadCard
              title="UPLOAD SYNOPSIS DOCUMENT (Optional)"
              fieldName="synopsisDocument"
              file={synopsisDocument}
              onFileChange={onFileChange}
            />
          </Grid>
        </Grid>
      </Paper>

      <Box
        sx={{
          mt: 0,
          px: { xs: 2, md: 2.5 },
          py: 2.5,
          bgcolor: '#f7f7f5',
          borderLeft: (theme) => `3px solid ${theme.palette.info.main}`
        }}
      >
        <Typography sx={{ fontSize: '1rem', fontWeight: 500, mb: 1.25 }}>Additional Information</Typography>
        <Box component="ol" sx={{ m: 0, pl: 2.25, color: 'text.primary' }}>
          <Typography component="li" sx={{ fontSize: '0.82rem', mb: 0.75 }}>
            Upload only one thesis per order
          </Typography>
          <Typography component="li" sx={{ fontSize: '0.82rem' }}>
            We prefer pdf.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function UploadCard({ title, fieldName, file, onFileChange, errorMessage = '' }) {
  const theme = useTheme();

  const handleInputChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    onFileChange(fieldName, selectedFile);
    event.target.value = '';
  };

  const isThesisUpload = fieldName === 'thesisDocument';
  const helperError = isThesisUpload ? errorMessage : '';

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 }, textAlign: 'center' }}>
      <Typography sx={{ fontSize: { xs: '1.15rem', md: '1.55rem' }, lineHeight: 1.15, fontWeight: 700, mb: 4 }}>
        {title}
      </Typography>

      <Box
        component="label"
        sx={{
          width: '100%',
          maxWidth: 300,
          minHeight: 208,
          mx: 'auto',
          border: `2px dashed ${alpha(theme.palette.secondary.main, 0.18)}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 3.5,
          bgcolor: 'common.white',
          cursor: 'pointer'
        }}
      >
        <input type="file" accept="application/pdf,.pdf" hidden onChange={handleInputChange} />
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: theme.palette.info.main,
            color: 'common.white',
            mb: 2
          }}
        >
          <CloudUploadOutlined style={{ fontSize: 22 }} />
        </Box>

        <Typography sx={{ fontSize: '0.83rem', letterSpacing: 0.5 }}>DROP YOUR FILE HERE</Typography>
        <Typography color="text.secondary" sx={{ fontSize: '0.8rem' }}>
          {file ? file.name : 'or click to select'}
        </Typography>
      </Box>

      <Box sx={{ mt: 2.5 }}>
        {helperError && (
          <Typography sx={{ fontSize: '0.84rem', color: 'error.main', mb: 0.5 }}>{helperError}</Typography>
        )}
        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>Maximum size allowed is 512MB.</Typography>
        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>Supported formats are: pdf</Typography>
        <Typography sx={{ mt: 0.75, fontSize: '0.84rem', color: 'info.main', textDecoration: 'underline' }}>Convert Doc to Pdf here</Typography>
      </Box>
    </Box>
  );
}

function DocumentDetailsStep({
  thesisDocument,
  pageStats,
  pageTypesError,
  onEditPageDetails,
  synopsisDocument,
  synopsisPageStats,
  onEditSynopsisPageDetails,
  selectedBindings,
  bindingSelectionError,
  onToggleBinding
}) {
  const theme = useTheme();

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2.5, md: 3 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              pb: 1.75,
              mb: 1.75,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography
              sx={{
                fontSize: '0.9rem',
                fontWeight: 600,
                letterSpacing: 0.6,
                textTransform: 'uppercase'
              }}
            >
              THESIS FILE NAME :
            </Typography>

            <Typography sx={{ fontSize: '0.92rem', color: 'text.secondary', flex: 1 }}>{thesisDocument?.name || 'No thesis file selected'}</Typography>

            <Button
  onClick={onEditPageDetails}
  variant="contained"
  sx={{
    px: 3,
    py: 1.1,
    borderRadius: 0,
    bgcolor: theme.palette.info.main,
    color: 'common.white',
    boxShadow: 'none',
    fontSize: '0.8rem',
    letterSpacing: 0.4,
    '&:hover': {
      bgcolor: theme.palette.info.dark,
      boxShadow: 'none',
      animation: 'none' // Stops flashing when the user hovers over it
    },
    
    // --- RAPID FLASHING ANIMATION ---
    animation: 'rapidFlash 0.8s infinite alternate',
    '@keyframes rapidFlash': {
      '0%': {
        bgcolor: theme.palette.info.main,
      },
      '100%': {
        bgcolor: '#d32f2f', // MUI's standard error/red color
      }
    }
  }}
>
  Edit
</Button>
          </Box>

          {pageTypesError ? (
            <Typography sx={{ mb: 2, fontSize: '0.82rem', color: 'warning.dark' }}>{pageTypesError}</Typography>
          ) : null}

          <Grid container spacing={1.5}>
            {pageStats.map((item, index) => (
              <Grid
                key={item.label}
                item
                xs={12}
                sm={4}
                sx={{
                  display: 'flex'
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    px: { xs: 2, md: 2.5 },
                    py: 2,
                    bgcolor: index % 2 === 0 ? alpha(theme.palette.info.main, 0.06) : alpha(theme.palette.info.main, 0.02),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.info.main, 0.12)
                  }}
                >
                  <Typography sx={{ mb: 1, fontSize: '0.82rem', color: 'text.secondary' }}>{item.label}</Typography>
                  <Typography sx={{ fontSize: '1.15rem', fontWeight: 600, color: 'text.primary' }}>{item.value}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>

      {synopsisDocument && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 0,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            mt: 2
          }}
        >
          <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2.5, md: 3 } }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'flex-start', md: 'center' },
                justifyContent: 'space-between',
                gap: 2,
                pb: 1.75,
                mb: 1.75,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  letterSpacing: 0.6,
                  textTransform: 'uppercase'
                }}
              >
                SYNOPSIS FILE NAME :
              </Typography>

              <Typography sx={{ fontSize: '0.92rem', color: 'text.secondary', flex: 1 }}>{synopsisDocument?.name}</Typography>

                <Button
                onClick={onEditSynopsisPageDetails}
                variant="contained"
                sx={{
                  px: 3,
                  py: 1.1,
                  borderRadius: 0,
                  bgcolor: theme.palette.info.main,
                  color: 'common.white',
                  boxShadow: 'none',
                  fontSize: '0.8rem',
                  letterSpacing: 0.4,
                  '&:hover': {
                    bgcolor: theme.palette.info.dark,
                    boxShadow: 'none',
                    animation: 'none' // Pauses the intense flashing when they go to click it
                  },
                  
                  // --- RAPID RED & CURRENT COLOR FLASH ---
                  animation: 'rapidFlash 0.6s infinite alternate ease-in-out',
                  '@keyframes rapidFlash': {
                    '0%': {
                      bgcolor: theme.palette.info.main,
                    },
                    '100%': {
                      bgcolor: '#d32f2f', // A clean, standard error red
                    }
                  }
                }}
              >
                Edit
              </Button>
            </Box>

            <Grid container spacing={1.5}>
              {synopsisPageStats.map((item, index) => (
                <Grid
                  key={item.label}
                  item
                  xs={12}
                  sm={4}
                  sx={{
                    display: 'flex'
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      px: { xs: 2, md: 2.5 },
                      py: 2,
                      bgcolor: index % 2 === 0 ? alpha(theme.palette.info.main, 0.06) : alpha(theme.palette.info.main, 0.02),
                      border: '1px solid',
                      borderColor: alpha(theme.palette.info.main, 0.12)
                    }}
                  >
                    <Typography sx={{ mb: 1, fontSize: '0.82rem', color: 'text.secondary' }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '1.15rem', fontWeight: 600, color: 'text.primary' }}>{item.value}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 500, mb: 2 }}>Select type of Binding</Typography>
        <Grid container>
          <Grid item xs={12} md={6}>
            <BindingOptionCard
              label="Hard Binding"
              active={selectedBindings.hard}
              onClick={() => onToggleBinding('hard')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <BindingOptionCard
              label="Soft Binding"
              active={selectedBindings.soft}
              onClick={() => onToggleBinding('soft')}
            />
          </Grid>
        </Grid>
        {bindingSelectionError ? (
          <Typography sx={{ mt: 1.5, fontSize: '0.84rem', color: 'error.main' }}>{bindingSelectionError}</Typography>
        ) : (
          <Typography sx={{ mt: 1.5, fontSize: '0.82rem', color: 'text.secondary' }}>
            Select at least one binding type. Choose both to configure both hard and soft binding pages.
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function PageEditorDialog({ open, loading, error, pageRows, pageTypes, onClose, onPageTypeChange, title = 'Thesis Document Pages' }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1.25, fontWeight: 600 }}>{title}</DialogTitle>
      <DialogContent dividers>
        <Grid container sx={{ mb: 1.5, borderBottom: '1px solid', borderColor: 'divider', pb: 1.5 }}>
          <Grid item xs={4}>
            <Typography sx={{ fontSize: '0.88rem', fontWeight: 600 }}>Page Number</Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography sx={{ fontSize: '0.88rem', fontWeight: 600 }}>Page Type</Typography>
          </Grid>
        </Grid>

        {loading ? (
          <Typography sx={{ py: 2, fontSize: '0.9rem', color: 'text.secondary' }}>Loading page types...</Typography>
        ) : null}

        {!loading && pageRows.length
          ? pageRows.map((row) => (
              <Grid container spacing={1.5} alignItems="center" key={row.pageNumber} sx={{ mb: 1.5 }}>
                <Grid item xs={4}>
                  <Typography sx={{ fontSize: '0.95rem', color: 'text.primary' }}>{row.pageNumber}</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={String(row.pageTypeId)}
                    onChange={(event) => onPageTypeChange(row.pageNumber, event.target.value)}
                  >
                    {pageTypes.map((option) => (
                      <MenuItem key={option.id} value={String(option.id)}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            ))
          : null}

        {error ? (
          <Typography sx={{ mt: 1, fontSize: '0.82rem', color: 'warning.dark' }}>{error}</Typography>
        ) : null}

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          justifyContent="flex-end"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          sx={{ mt: 2.5 }}
        >
          <Typography sx={{ maxWidth: 360, fontSize: '0.88rem', color: 'text.secondary' }}>
            Change page types from the dropdown. Updates are applied immediately to the page totals.
          </Typography>
          <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 0 }}>
            Close
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function BindingOptionCard({ label, active, onClick }) {
  const theme = useTheme();

  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        px: { xs: 2.5, md: 3 },
        py: 2,
        border: '1px solid',
        borderColor: active ? theme.palette.info.main : 'divider',
        bgcolor: active ? alpha(theme.palette.info.main, 0.04) : 'common.white',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5
      }}
    >
      <Box
        sx={{
          width: 18,
          height: 18,
          borderRadius: 0,
          border: `2px solid ${theme.palette.info.main}`,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0
        }}
      >
        {active && (
          <Box
            sx={{
              width: 10,
              height: 10,
              bgcolor: theme.palette.info.main
            }}
          />
        )}
      </Box>
      <Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }}>{label}</Typography>
    </Box>
  );
}

function MasterSelectField({ label, value, onChange, options, placeholder = 'Select' }) {
  return (
    <>
      <Typography sx={{ fontSize: '0.8rem', mb: 0.5 }}>{label}</Typography>
      <TextField select size="small" fullWidth value={value} onChange={onChange} SelectProps={{ displayEmpty: true }}>
        <MenuItem value="">{placeholder}</MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </>
  );
}

let bindingPrintDetailId = 0;

function createBindingPrintDetail() {
  bindingPrintDetailId += 1;

  return {
    id: `binding-print-detail-${bindingPrintDetailId}`,
    paperSize: '',
    copies: 0,
    paper: '',
    printingColour: '',
    printingType: '',
    a4Pockets: 0,
    cdPockets: 0,
    additionalInformation: ''
  };
}

function createBindingConfiguration() {
  return {
    printDetails: [createBindingPrintDetail()],
    selectedCover: '',
    spinePrinting: 'not-required',
    coverDesignMode: 'same',
    coverDesignFile: null,
    spineContent: {
      top: '',
      middle: '',
      bottom: ''
    }
  };
}

function QuantityField({ label, value, onDecrease, onIncrease, onChange }) {
  return (
    <Box>
      <Typography sx={{ fontSize: '0.8rem', mb: 0.5 }}>{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, width: '100%' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={onDecrease}
          sx={{
            minWidth: 32,
            borderRadius: 0,
            borderColor: (theme) => alpha(theme.palette.secondary.main, 0.4)
          }}
        >
          -
        </Button>
        <TextField
          size="small"
          value={value}
          onChange={onChange}
          sx={{ flex: 1, minWidth: 0, '& .MuiInputBase-input': { textAlign: 'center' } }}
        />
        <Button
          variant="outlined"
          size="small"
          onClick={onIncrease}
          sx={{
            minWidth: 32,
            borderRadius: 0,
            borderColor: (theme) => alpha(theme.palette.secondary.main, 0.4)
          }}
        >
          +
        </Button>
      </Box>
    </Box>
  );
}

export function BindingPrintDetailsCard({
  title,
  detail,
  masterOptions,
  masterError,
  showA4Pockets,
  showCdPockets,
  a4PocketsLabel,
  cdPocketsLabel,
  onDetailChange,
  onQuantityAdjust,
  onAddNew,
  canDelete,
  onDelete
}) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 0,
        border: '1px solid',
        borderColor: 'divider',
        mb: 4
      }}
    >
      <Box sx={{ px: { xs: 2, md: 3 }, pt: { xs: 2, md: 2.5 }, pb: { xs: 2.5, md: 3 } }}>
        <Typography sx={{ fontSize: '0.98rem', fontWeight: 600, mb: 2 }}>{title}</Typography>

        {masterError ? (
          <Typography sx={{ mb: 1.5, fontSize: '0.82rem', color: 'warning.dark' }}>{masterError}</Typography>
        ) : null}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))'
            },
            gap: 1.5,
            alignItems: 'start',
            mb: 2
          }}
        >
          <Box>
            <MasterSelectField
              label="Papers Size"
              value={detail.paperSize}
              onChange={(event) => onDetailChange(detail.id, 'paperSize', event.target.value)}
              options={masterOptions.paperSizes}
              placeholder="Select paper size"
            />
          </Box>
          <Box>
            <QuantityField
                label="No. Of Copies"
                value={detail.copies}
                onDecrease={() => {
                  if (detail.copies > 1) {
                    onQuantityAdjust(detail.id, 'copies', -1);
                  }
                }}
                onIncrease={() => onQuantityAdjust(detail.id, 'copies', 1)}
                onChange={(event) => {
                  const value = parseInt(event.target.value, 10);
                  // If it's not a number or less than 1, force it to 1
                  const safeValue = isNaN(value) || value < 1 ? 1 : value;
                  onDetailChange(detail.id, 'copies', safeValue);
                }}
              />
          </Box>
          <Box>
            <MasterSelectField
              label="Papers"
              value={detail.paper}
              onChange={(event) => onDetailChange(detail.id, 'paper', event.target.value)}
              options={masterOptions.papers}
              placeholder="Select paper"
            />
          </Box>
          <Box>
            <MasterSelectField
              label="Printing Colour"
              value={detail.printingColour}
              onChange={(event) => onDetailChange(detail.id, 'printingColour', event.target.value)}
              options={masterOptions.printColors}
              placeholder="Select printing colour"
            />
          </Box>
          <Box>
            <MasterSelectField
              label="Printing Type"
              value={detail.printingType}
              onChange={(event) => onDetailChange(detail.id, 'printingType', event.target.value)}
              options={masterOptions.printingTypes}
              placeholder="Select printing type"
            />
          </Box>
          {showA4Pockets ? (
            <Box>
              <QuantityField
                label={a4PocketsLabel}
                value={detail.a4Pockets}
                onDecrease={() => onQuantityAdjust(detail.id, 'a4Pockets', -1)}
                onIncrease={() => onQuantityAdjust(detail.id, 'a4Pockets', 1)}
                onChange={(event) => onDetailChange(detail.id, 'a4Pockets', event.target.value)}
              />
            </Box>
          ) : null}

        {showCdPockets ? (
          <Box>
              <QuantityField
                label={cdPocketsLabel}
                value={detail.cdPockets}
                onDecrease={() => onQuantityAdjust(detail.id, 'cdPockets', -1)}
                onIncrease={() => onQuantityAdjust(detail.id, 'cdPockets', 1)}
                onChange={(event) => onDetailChange(detail.id, 'cdPockets', event.target.value)}
              />
          </Box>
        ) : null}
        </Box>

        <Typography sx={{ fontSize: '0.8rem', mb: 0.5 }}>Additional Information</Typography>
        <TextField
          fullWidth
          multiline
          minRows={2}
          size="small"
          value={detail.additionalInformation}
          onChange={(event) => onDetailChange(detail.id, 'additionalInformation', event.target.value)}
          sx={{ mb: 2.5 }}
        />

        <Box
          sx={{
            mt: 1,
            pt: 1.5,
            borderTop: '1px dashed',
            borderColor: alpha(theme.palette.secondary.main, 0.2),
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {/* <Typography sx={{ fontSize: '0.8rem' }}>Papers Size : {selectedPaperSizeOption?.label || '-'}</Typography> */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            {/* <Typography sx={{ fontSize: '0.8rem' }}>No Of Copies : {detail.copies}</Typography> */}
            {canDelete ? (
              <Box
                onClick={onDelete}
                sx={{
                  color: 'error.main',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.75
                  }
                }}
              >
                <DeleteOutlined style={{ fontSize: 14 }} />
              </Box>
            ) : null}
          </Box>
        </Box>

        <Box sx={{ mt: 1.5 }}>
          <Button
            variant="contained"
            onClick={onAddNew}
            sx={{
              borderRadius: 0,
              px: 3,
              py: 0.75,
              bgcolor: theme.palette.warning.lighter,
              color: theme.palette.text.primary,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: theme.palette.warning.light,
                boxShadow: 'none'
              }
            }}
          >
            + Create New
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

function BindingStep({
  printTitle,
  bindingTitle,
  coverLabel,
  coverMaterials,
  masterOptions,
  masterError,
  a4PocketsLabel,
  cdPocketsLabel,
  showCdPockets,
  bindingConfig,
  onBindingConfigChange
}) {
  const theme = useTheme();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const printDetails = bindingConfig.printDetails;
  const selectedCover = bindingConfig.selectedCover;
  const spinePrinting = bindingConfig.spinePrinting;
  const coverDesignMode = bindingConfig.coverDesignMode;
  const coverDesignFile = bindingConfig.coverDesignFile;
  const spineContent = bindingConfig.spineContent;

  useEffect(() => {
    if (!coverMaterials.length) {
      if (bindingConfig.selectedCover) {
        onBindingConfigChange((prev) => ({ ...prev, selectedCover: '' }));
      }
      return;
    }

    onBindingConfigChange((prev) => ({
      ...prev,
      selectedCover: coverMaterials.some((item) => item.id === prev.selectedCover) ? prev.selectedCover : coverMaterials[0].id
    }));
  }, [bindingConfig.selectedCover, coverMaterials, onBindingConfigChange]);

  const openImagePreview = (image) => {
    if (!image) {
      return;
    }

    setPreviewImage(image);
    setPreviewOpen(true);
  };

  const closeImagePreview = () => {
    setPreviewOpen(false);
    setPreviewImage('');
  };

  const handleDetailChange = (detailId, field, value) => {
    onBindingConfigChange((prev) => ({
      ...prev,
      printDetails: prev.printDetails.map((detail) => {
        if (detail.id !== detailId) {
          return detail;
        }

        if (field === 'paperSize') {
          return {
            ...detail,
            paperSize: value,
            a4Pockets: 0,
            cdPockets: 0
          };
        }

        if (['copies', 'a4Pockets', 'cdPockets'].includes(field)) {
          const numericValue = Number.parseInt(value, 10);

          return {
            ...detail,
            [field]: Number.isNaN(numericValue) ? 0 : Math.max(0, numericValue)
          };
        }

        return {
          ...detail,
          [field]: value
        };
      })
    }));
  };

  const handleQuantityAdjust = (detailId, field, delta) => {
    onBindingConfigChange((prev) => ({
      ...prev,
      printDetails: prev.printDetails.map((detail) =>
        detail.id === detailId
          ? {
              ...detail,
              [field]: Math.max(0, Number(detail[field] || 0) + delta)
            }
          : detail
      )
    }));
  };

  const handleAddPrintDetail = () => {
    onBindingConfigChange((prev) => ({
      ...prev,
      printDetails: [...prev.printDetails, createBindingPrintDetail()]
    }));
  };

  const handleDeletePrintDetail = (detailId) => {
    onBindingConfigChange((prev) => ({
      ...prev,
      printDetails: prev.printDetails.length > 1 ? prev.printDetails.filter((detail) => detail.id !== detailId) : prev.printDetails
    }));
  };

  const handleCoverDesignModeChange = (mode) => {
    onBindingConfigChange((prev) => ({
      ...prev,
      coverDesignMode: mode,
      coverDesignFile: mode === 'upload' ? prev.coverDesignFile : null
    }));
  };

  const handleCoverDesignFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    onBindingConfigChange((prev) => ({
      ...prev,
      coverDesignFile: file
    }));
    event.target.value = '';
  };

  const handleSpineContentChange = (field, value) => {
    onBindingConfigChange((prev) => ({
      ...prev,
      spineContent: {
        ...prev.spineContent,
        [field]: value
      }
    }));
  };

  const handleSpinePrintingChange = (value) => {
    onBindingConfigChange((prev) => ({
      ...prev,
      spinePrinting: value,
      spineContent: value === 'not-required' ? { top: '', middle: '', bottom: '' } : prev.spineContent
    }));
  };

  const isSameCoverDesign = coverDesignMode === 'same';
  const isUploadCoverDesign = coverDesignMode === 'upload';

  return (
    <Box>
      {printDetails.map((detail, index) => {
        const selectedPaperSizeOption = masterOptions.paperSizes.find((option) => option.value === detail.paperSize);
        const isA4Full = selectedPaperSizeOption?.code === 'A4 - FULL';

        return (
          <BindingPrintDetailsCard
            key={detail.id}
            title={printDetails.length > 1 ? `${printTitle} ${index + 1}` : printTitle}
            detail={detail}
            masterOptions={masterOptions}
            masterError={masterError}
            showA4Pockets={isA4Full}
            showCdPockets={showCdPockets && isA4Full}
            a4PocketsLabel={a4PocketsLabel}
            cdPocketsLabel={cdPocketsLabel}
            onDetailChange={handleDetailChange}
            onQuantityAdjust={handleQuantityAdjust}
            onAddNew={handleAddPrintDetail}
            canDelete={index > 0}
            onDelete={() => handleDeletePrintDetail(detail.id)}
          />
        );
      })}

      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 2.5 } }}>
          <Typography sx={{ fontSize: '0.98rem', fontWeight: 600, mb: 2 }}>{bindingTitle}</Typography>

          <Typography sx={{ fontSize: '0.8rem', mb: 1.5 }}>{coverLabel}</Typography>

          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            {coverMaterials.map((coverMaterial) => {
              const isActive = coverMaterial.id === selectedCover;

              return (
                <Grid key={coverMaterial.id} item xs={6} sm={4} md={3}>
                  <Box
                    onClick={() =>
                      onBindingConfigChange((prev) => ({
                        ...prev,
                        selectedCover: coverMaterial.id
                      }))
                    }
                    sx={{
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: isActive ? theme.palette.info.main : 'divider',
                      bgcolor: 'common.white',
                      p: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.75
                    }}
                  >
                    <Box
                      component={coverMaterial.design ? 'img' : 'div'}
                      src={coverMaterial.design || undefined}
                      alt={coverMaterial.name}
                      onClick={
                        coverMaterial.design
                          ? (event) => {
                              event.stopPropagation();
                              openImagePreview(coverMaterial.design);
                            }
                          : undefined
                      }
                      sx={{
                        width: 60,
                        height: 81,
                        objectFit: 'cover',
                        borderRadius: 0.5,
                        border: '1px solid rgba(0,0,0,0.12)',
                        cursor: coverMaterial.design ? 'zoom-in' : 'default',
                        transition: 'transform 0.15s ease-in-out',
                        bgcolor: isActive ? alpha(theme.palette.info.main, 0.3) : alpha(theme.palette.secondary.main, 0.08),
                        '&:hover': coverMaterial.design
                          ? {
                              transform: 'scale(1.1)'
                            }
                          : undefined
                      }}
                    />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{coverMaterial.code}</Typography>
                      {coverMaterial.name && coverMaterial.name !== coverMaterial.code ? (
                        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{coverMaterial.name}</Typography>
                      ) : null}
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          {!coverMaterials.length ? (
            <Typography color="text.secondary" sx={{ fontSize: '0.75rem', mb: 2 }}>
              No {bindingTitle.toLowerCase()} are available right now.
            </Typography>
          ) : null}

          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mb: 0.75 }}>
                <Typography sx={{ fontSize: '0.8rem' }}>Cover Page Design</Typography>
                <Tooltip title="Select from the below option on what should be the design for the cover page of the Thesis.">
                  <Box component="span" sx={{ display: 'inline-flex', cursor: 'help' }}>
                    <InfoCircleOutlined style={{ fontSize: 12, color: theme.palette.info.main }} />
                  </Box>
                </Tooltip>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  variant={isSameCoverDesign ? 'contained' : 'outlined'}
                  onClick={() => handleCoverDesignModeChange('same')}
                  aria-pressed={isSameCoverDesign}
                  sx={{
                    borderRadius: 0,
                    bgcolor: isSameCoverDesign ? '#13c2c2' : 'common.white',
                    color: isSameCoverDesign ? 'common.white' : 'text.primary',
                    boxShadow: 'none',
                    px: 2.5,
                    py: 0.8,
                    borderColor: isSameCoverDesign ? '#13c2c2' : alpha(theme.palette.secondary.main, 0.4),
                    '&:hover': {
                      bgcolor: theme.palette.warning.light,
                      color: 'text.primary',
                      borderColor: theme.palette.warning.light,
                      boxShadow: 'none'
                    }
                  }}
                >
                  Same as Thesis Cover
                </Button>
                <Button
                  variant={isUploadCoverDesign ? 'contained' : 'outlined'}
                  onClick={() => handleCoverDesignModeChange('upload')}
                  aria-pressed={isUploadCoverDesign}
                  sx={{
                    borderRadius: 0,
                    px: 2.5,
                    py: 0.8,
                    bgcolor: isUploadCoverDesign ? '#13c2c2' : 'common.white',
                    color: isUploadCoverDesign ? 'common.white' : 'text.primary',
                    borderColor: isUploadCoverDesign ? '#13c2c2' : alpha(theme.palette.secondary.main, 0.4),
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: theme.palette.warning.light,
                      color: 'text.primary',
                      borderColor: theme.palette.warning.light,
                      boxShadow: 'none'
                    }
                  }}
                >
                  Upload New Design
                </Button>
              </Stack>

              {isUploadCoverDesign ? (
                <Box sx={{ mt: 1.5, maxWidth: 290 }}>
                  <Box
                    component="label"
                    sx={{
                      minHeight: 102,
                      px: 2,
                      py: 2.25,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.secondary.main, 0.18),
                      bgcolor: 'common.white',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      cursor: 'pointer'
                    }}
                  >
                    <input type="file" hidden accept="image/*,.pdf" onChange={handleCoverDesignFileChange} />
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: theme.palette.info.main,
                        color: 'common.white'
                      }}
                    >
                      <CloudUploadOutlined style={{ fontSize: 24 }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.8rem', color: 'text.primary' }}>
                      {coverDesignFile ? coverDesignFile.name : 'Upload New Design'}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={0.4} alignItems="center" sx={{ mt: 1, mb: 1.25 }}>
                    <Typography sx={{ fontSize: '0.72rem', color: 'text.primary' }}>
                      *Maximum size allowed is 512MB. Supported formats are: pdf
                    </Typography>
                    <InfoCircleOutlined style={{ fontSize: 12, color: theme.palette.info.main }} />
                  </Stack>

                  <Box component="label" sx={{ display: 'block', cursor: 'pointer' }}>
                    <input type="file" hidden accept="image/*,.pdf" onChange={handleCoverDesignFileChange} />
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        borderRadius: 0,
                        py: 0.9,
                        bgcolor: theme.palette.warning.lighter,
                        color: theme.palette.text.primary,
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: theme.palette.warning.light,
                          boxShadow: 'none'
                        }
                      }}
                    >
                      Upload File
                    </Button>
                  </Box>
                </Box>
              ) : null}

              <Box sx={{ mt: 2 }}>
                <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mb: 0.75 }}>
                  <Typography sx={{ fontSize: '0.8rem' }}>Spine Printing Details</Typography>
                  <Tooltip title="The text that will be on the back portion of a book's binding which is visible when a book is shelved in a bookcase">
                    <Box component="span" sx={{ display: 'inline-flex', cursor: 'help' }}>
                      <InfoCircleOutlined style={{ fontSize: 12, color: theme.palette.info.main }} />
                    </Box>
                  </Tooltip>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button
                    variant={spinePrinting === 'required' ? 'contained' : 'outlined'}
                    onClick={() => handleSpinePrintingChange('required')}
                    sx={{
                      borderRadius: 0,
                      px: 2.5,
                      py: 0.8,
                      bgcolor: spinePrinting === 'required' ? '#13c2c2' : 'common.white',
                      color: spinePrinting === 'required' ? 'common.white' : 'text.primary',
                      borderColor: spinePrinting === 'required' ? '#13c2c2' : alpha(theme.palette.info.main, 0.6),
                      boxShadow: 'none',
                      '&:hover': {
                          bgcolor: theme.palette.warning.light,
                          color: 'text.primary',
                          borderColor: theme.palette.warning.light,
                        boxShadow: 'none'
                      }
                    }}
                  >
                    Spine Printing Required
                  </Button>
                  <Button
                    variant={spinePrinting === 'not-required' ? 'contained' : 'outlined'}
                    onClick={() => handleSpinePrintingChange('not-required')}
                    sx={{
                      borderRadius: 0,
                      px: 2.5,
                      py: 0.8,
                      bgcolor: spinePrinting === 'not-required' ? '#13c2c2' : 'common.white',
                      color: spinePrinting === 'not-required' ? 'common.white' : 'text.primary',
                      borderColor: spinePrinting === 'not-required' ? '#13c2c2' : alpha(theme.palette.secondary.main, 0.4),
                      boxShadow: 'none',
                      '&:hover': {
                          bgcolor: theme.palette.warning.light,
                          color: 'text.primary',
                          borderColor: theme.palette.warning.light,
                        boxShadow: 'none'
                      }
                    }}
                  >
                    Spine Printing Not Required
                  </Button>
                </Stack>
              </Box>
            </Grid>
          </Grid>

          {spinePrinting === 'required' ? (
            <Grid container spacing={1.5} sx={{ mt: 1.75 }}>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography sx={{ fontSize: '0.8rem' }}>Top Content Area</Typography>
                  <Tooltip title="Content that will be on the top portion of the spine of the book's binding.">
                    <Box component="span" sx={{ display: 'inline-flex', cursor: 'help' }}>
                      <InfoCircleOutlined style={{ fontSize: 12, color: theme.palette.info.main }} />
                    </Box>
                  </Tooltip>
                </Stack>
                <TextField fullWidth size="small" value={spineContent.top} onChange={(event) => handleSpineContentChange('top', event.target.value)} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography sx={{ fontSize: '0.8rem' }}>Middle Content Area</Typography>
                  <Tooltip title="Content that will be on the middle portion of the spine of the book's binding.">
                    <Box component="span" sx={{ display: 'inline-flex', cursor: 'help' }}>
                      <InfoCircleOutlined style={{ fontSize: 12, color: theme.palette.info.main }} />
                    </Box>
                  </Tooltip>
                </Stack>
                <TextField
                  fullWidth
                  size="small"
                  value={spineContent.middle}
                  onChange={(event) => handleSpineContentChange('middle', event.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography sx={{ fontSize: '0.8rem' }}>Bottom Content Area</Typography>
                  <Tooltip title="Content that will be on the bottom portion of the spine of the book's binding.">
                    <Box component="span" sx={{ display: 'inline-flex', cursor: 'help' }}>
                      <InfoCircleOutlined style={{ fontSize: 12, color: theme.palette.info.main }} />
                    </Box>
                  </Tooltip>
                </Stack>
                <TextField
                  fullWidth
                  size="small"
                  value={spineContent.bottom}
                  onChange={(event) => handleSpineContentChange('bottom', event.target.value)}
                />
              </Grid>
            </Grid>
          ) : null}
        </Box>
      </Paper>

      <Dialog fullScreen open={previewOpen} onClose={closeImagePreview} sx={{ bgcolor: 'rgba(0,0,0,0.9)' }}>
        <Box
          sx={{
            position: 'fixed',
            top: 16,
            right: 24,
            zIndex: 1301,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <Button variant="contained" color="secondary" size="small" onClick={closeImagePreview}>
            Close
          </Button>
        </Box>
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'black'
          }}
        >
          {previewImage ? (
            <Box
              component="img"
              src={previewImage}
              alt="Design full preview"
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                boxShadow: 24
              }}
            />
          ) : null}
        </Box>
      </Dialog>
    </Box>
  );
}

function HardBindingStep({ masterOptions, masterError, coverMaterials = [], bindingConfig, onBindingConfigChange }) {
  return (
    <BindingStep
      printTitle="Hard Print Details"
      bindingTitle="Hard Binding Details"
      coverLabel="Colour of Covering Materials (Block)"
      coverMaterials={coverMaterials}
      masterOptions={masterOptions}
      masterError={masterError}
      a4PocketsLabel="A4 Pockets"
      cdPocketsLabel="CD Pockets"
      showCdPockets={false}
      bindingConfig={bindingConfig}
      onBindingConfigChange={onBindingConfigChange}
    />
  );
}

function SoftBindingStep({ masterOptions, masterError, coverMaterials = [], bindingConfig, onBindingConfigChange }) {
  return (
    <BindingStep
      printTitle="Soft Print Details"
      bindingTitle="Soft Binding Details"
      coverLabel="Colour of Covering Materials (Soft)"
      coverMaterials={coverMaterials}
      masterOptions={masterOptions}
      masterError={masterError}
      a4PocketsLabel="A4 Pockets (NOT RECOMMENDED)"
      cdPocketsLabel="CD Pockets (NOT RECOMMENDED)"
      showCdPockets
      bindingConfig={bindingConfig}
      onBindingConfigChange={onBindingConfigChange}
    />
  );
}

function OrderSummaryStep({ summary, loading, error }) {
  const theme = useTheme();

  const border = `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`;
  const tableHeaderBg = alpha(theme.palette.info.main, 0.1);
  const subTotalBg = alpha(theme.palette.info.main, 0.08);
  const printRows = Array.isArray(summary?.printingDetails) ? summary.printingDetails : [];
  const bindingRows = Array.isArray(summary?.bindingDetails) ? summary.bindingDetails : [];

  const tableBaseStyles = {
    width: '100%',
    borderCollapse: 'collapse',
    '& th, & td': {
      border,
      px: 1.5,
      py: 1,
      fontSize: '0.8rem',
      textAlign: 'left'
    }
  };

  return (
    <Box>
      <Typography
        sx={{
          fontSize: { xs: '1.2rem', md: '1.4rem' },
          fontWeight: 600,
          textAlign: 'center',
          mb: 3
        }}
      >
        Order Summary
      </Typography>

      {loading ? <Typography sx={{ textAlign: 'center', mb: 2, color: 'text.secondary' }}>Loading order summary...</Typography> : null}

      {error ? <Typography sx={{ textAlign: 'center', mb: 2, color: 'error.main' }}>{error}</Typography> : null}

      <Box sx={{ border, mb: 3, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.5, bgcolor: alpha(theme.palette.info.main, 0.06), borderBottom: border }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>Printing Details</Typography>
        </Box>

        <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
          <Box component="table" sx={{ ...tableBaseStyles, mb: 2.5 }}>
            <Box component="thead">
              <Box component="tr" sx={{ bgcolor: tableHeaderBg }}>
                {['Description', 'Copies', 'Colour/ BW', '1st Copy Rate', 'Additional Copy Rate', 'Cost'].map((header) => (
                  <Box key={header} component="th" sx={{ fontWeight: 600 }}>
                    {header}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {printRows.length ? (
                printRows.map((row, index) => (
                  <Box key={`${row.description || 'print'}-${index}`} component="tr">
                    <Box component="td">{row.description || '-'}</Box>
                    <Box component="td">{row.copies ?? 0}</Box>
                    <Box component="td">{row.colorType || '-'}</Box>
                    <Box component="td">{row.firstCopyRate ?? 0}</Box>
                    <Box component="td">{row.additionalCopyRate ?? 0}</Box>
                    <Box component="td" sx={{ color: theme.palette.info.main }}>&#x20B9; {row.cost ?? 0}</Box>
                  </Box>
                ))
              ) : (
                <Box component="tr">
                  <Box component="td">-</Box>
                  <Box component="td">0</Box>
                  <Box component="td">-</Box>
                  <Box component="td">0</Box>
                  <Box component="td">0</Box>
                  <Box component="td" sx={{ color: theme.palette.info.main }}>&#x20B9; 0</Box>
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ px: 2, py: 1.5, bgcolor: subTotalBg, display: 'flex', justifyContent: 'space-between', border }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: theme.palette.info.main }}>Printing Cost</Typography>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: theme.palette.info.main }}>&#x20B9; {summary?.summary?.printingCost ?? 0}</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ border, mb: 3, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.5, bgcolor: alpha(theme.palette.info.main, 0.06), borderBottom: border }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>Binding Details</Typography>
        </Box>

        <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
          <Box component="table" sx={{ ...tableBaseStyles, mb: 2.5 }}>
            <Box component="thead">
              <Box component="tr" sx={{ bgcolor: tableHeaderBg }}>
                {['Description', 'Copies', 'Cost'].map((header) => (
                  <Box key={header} component="th" sx={{ fontWeight: 600 }}>
                    {header}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {bindingRows.length ? (
                bindingRows.map((row, index) => (
                  <Box key={`${row.description || 'binding'}-${index}`} component="tr">
                    <Box component="td">{row.description || '-'}</Box>
                    <Box component="td">{row.copies ?? 0}</Box>
                    <Box component="td" sx={{ color: theme.palette.info.main }}>&#x20B9; {row.cost ?? 0}</Box>
                  </Box>
                ))
              ) : (
                <Box component="tr">
                  <Box component="td">-</Box>
                  <Box component="td">0</Box>
                  <Box component="td" sx={{ color: theme.palette.info.main }}>&#x20B9; 0</Box>
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ px: 2, py: 1.5, bgcolor: subTotalBg, display: 'flex', justifyContent: 'space-between', border }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: theme.palette.info.main }}>Binding Cost</Typography>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: theme.palette.info.main }}>&#x20B9; {summary?.summary?.bindingCost ?? 0}</Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 1.5,
          border,
          mt: 0.5
        }}
      >
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: theme.palette.info.main }}>Total</Typography>
        <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>{summary?.summary?.totalAmount ?? 0} INR</Typography>
      </Box>
    </Box>
  );
}

function CheckoutStep({ summary, checkoutForm, checkoutError, branchOptions, branchLoading, branchError, onFieldChange }) {
  const theme = useTheme();
  const border = `1px solid ${alpha(theme.palette.secondary.main, 0.16)}`;
  const cardShadow = theme.vars.customShadows?.z1 || '0 8px 30px rgba(0, 0, 0, 0.06)';
  const totalAmount = summary?.summary?.totalAmount ?? 0;
  const subTotal = summary?.summary?.subTotal ?? summary?.summary?.printingCost ?? 0;
  const gstAmount = summary?.summary?.gstAmount ?? summary?.summary?.taxAmount ?? 0;
  const showShippingAddress = checkoutForm.shippingMode === 'delivery' && !checkoutForm.shippingSameAsBilling;

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 0,
      bgcolor: 'common.white'
    }
  };

  return (
    <Box>
      <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.45rem' }, fontWeight: 600, mb: 3 }}>Check Out</Typography>

      <Grid container spacing={3} alignItems="flex-start">
        <Grid item xs={12} lg={8}>
          <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 0, border, boxShadow: cardShadow }}>
            <Typography sx={{ fontSize: '1.55rem', fontWeight: 600, mb: 3 }}>Contact</Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <FieldLabel>Phone Number</FieldLabel>
                <TextField fullWidth value={checkoutForm.mobile} onChange={(event) => onFieldChange('mobile', event.target.value)} sx={inputSx} />
              </Grid>
              <Grid item xs={12}>
                <FieldLabel>Email</FieldLabel>
                <TextField fullWidth value={checkoutForm.customerEmail} onChange={(event) => onFieldChange('customerEmail', event.target.value)} sx={inputSx} />
              </Grid>
            </Grid>

            <Typography sx={{ fontSize: '1.55rem', fontWeight: 600, mt: 4, mb: 3 }}>Billing Address</Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <FieldLabel>First Name</FieldLabel>
                <TextField fullWidth value={checkoutForm.firstName} onChange={(event) => onFieldChange('firstName', event.target.value)} sx={inputSx} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FieldLabel>Last Name</FieldLabel>
                <TextField fullWidth value={checkoutForm.lastName} onChange={(event) => onFieldChange('lastName', event.target.value)} sx={inputSx} />
              </Grid>
              <Grid item xs={12}>
                <FieldLabel>GST</FieldLabel>
                <TextField fullWidth value={checkoutForm.gst} onChange={(event) => onFieldChange('gst', event.target.value)} sx={inputSx} />
              </Grid>
              <Grid item xs={12}>
                <FieldLabel>University Name</FieldLabel>
                <TextField fullWidth value={checkoutForm.universityName} onChange={(event) => onFieldChange('universityName', event.target.value)} sx={inputSx} />
              </Grid>
              <Grid item xs={12}>
                <FieldLabel>University Department</FieldLabel>
                <TextField fullWidth value={checkoutForm.universityDepartment} onChange={(event) => onFieldChange('universityDepartment', event.target.value)} sx={inputSx} />
              </Grid>
              <Grid item xs={12}>
                <FieldLabel>Address</FieldLabel>
                <TextField fullWidth value={checkoutForm.customerAddress1} onChange={(event) => onFieldChange('customerAddress1', event.target.value)} sx={inputSx} />
              </Grid>
              <Grid item xs={12}>
                <FieldLabel>Apartment, suite, etc. (optional)</FieldLabel>
                <TextField fullWidth value={checkoutForm.customerAddress2} onChange={(event) => onFieldChange('customerAddress2', event.target.value)} sx={inputSx} />
              </Grid>
              <Grid item xs={12}>
                <FieldLabel>Country</FieldLabel>
                <TextField fullWidth value={checkoutForm.country} onChange={(event) => onFieldChange('country', event.target.value)} sx={inputSx} />
              </Grid>
              <Grid item xs={12} md={4}>
                <FieldLabel>City</FieldLabel>
                <TextField fullWidth value={checkoutForm.customerCity} onChange={(event) => onFieldChange('customerCity', event.target.value)} sx={inputSx} />
              </Grid>
              <Grid item xs={12} md={4}>
                <FieldLabel>State</FieldLabel>
                <TextField fullWidth value={checkoutForm.state} onChange={(event) => onFieldChange('state', event.target.value)} sx={inputSx} />
              </Grid>
              <Grid item xs={12} md={4}>
                <FieldLabel>PIN code</FieldLabel>
                <TextField fullWidth value={checkoutForm.pincode} onChange={(event) => onFieldChange('pincode', event.target.value)} sx={inputSx} />
              </Grid>
            </Grid>

            <Typography sx={{ fontSize: '1.55rem', fontWeight: 600, mt: 4, mb: 3 }}>Shipping Address</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
              <CheckoutToggleButton active={checkoutForm.shippingMode === 'pickup'} onClick={() => onFieldChange('shippingMode', 'pickup')}>
                I will Collect in Person
              </CheckoutToggleButton>
              <CheckoutToggleButton active={checkoutForm.shippingMode === 'delivery'} onClick={() => onFieldChange('shippingMode', 'delivery')}>
                To be Sent to the Address
              </CheckoutToggleButton>
            </Stack>

            {checkoutForm.shippingMode === 'delivery' ? (
              <>
                <CheckoutToggleButton active={checkoutForm.shippingSameAsBilling} onClick={() => onFieldChange('shippingSameAsBilling', !checkoutForm.shippingSameAsBilling)}>
                  Same As Billing Address
                </CheckoutToggleButton>

                {showShippingAddress ? (
                  <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                    <Grid item xs={12}>
                      <FieldLabel>Address</FieldLabel>
                      <TextField fullWidth value={checkoutForm.shippingAddress1} onChange={(event) => onFieldChange('shippingAddress1', event.target.value)} sx={inputSx} />
                    </Grid>
                    <Grid item xs={12}>
                      <FieldLabel>Apartment, suite, etc. (optional)</FieldLabel>
                      <TextField fullWidth value={checkoutForm.shippingAddress2} onChange={(event) => onFieldChange('shippingAddress2', event.target.value)} sx={inputSx} />
                    </Grid>
                    <Grid item xs={12}>
                      <FieldLabel>Country</FieldLabel>
                      <TextField fullWidth value={checkoutForm.shippingCountry} onChange={(event) => onFieldChange('shippingCountry', event.target.value)} sx={inputSx} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FieldLabel>City</FieldLabel>
                      <TextField fullWidth value={checkoutForm.shippingCity} onChange={(event) => onFieldChange('shippingCity', event.target.value)} sx={inputSx} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FieldLabel>State</FieldLabel>
                      <TextField fullWidth value={checkoutForm.shippingState} onChange={(event) => onFieldChange('shippingState', event.target.value)} sx={inputSx} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FieldLabel>PIN code</FieldLabel>
                      <TextField fullWidth value={checkoutForm.shippingPincode} onChange={(event) => onFieldChange('shippingPincode', event.target.value)} sx={inputSx} />
                    </Grid>
                  </Grid>
                ) : null}
              </>
            ) : (
              <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                <Grid item xs={12}>
                  <FieldLabel>Select Branch</FieldLabel>
                  <TextField
                    select
                    fullWidth
                    value={checkoutForm.shippingBranchId}
                    onChange={(event) => onFieldChange('shippingBranchId', event.target.value)}
                    sx={inputSx}
                    disabled={branchLoading || !branchOptions.length}
                    helperText={branchError || (branchLoading ? 'Loading branches...' : '')}
                  >
                    {branchOptions.map((branch) => (
                      <MenuItem key={branch.value} value={branch.value}>
                        {branch.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            )}

            {checkoutError ? (
              <Typography color="error" sx={{ mt: 2, fontSize: '0.85rem' }}>
                {checkoutError}
              </Typography>
            ) : null}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 0, border, boxShadow: cardShadow, position: { lg: 'sticky' }, top: 24 }}>
            <Typography sx={{ fontSize: '1.2rem', fontWeight: 600, mb: 2 }}>Order Summary</Typography>

            <Stack spacing={1.5} sx={{ mb: 2.5 }}>
              <SummaryLine label="Sub Total" value={`${subTotal} INR`} />
              <SummaryLine label="GST | 9 %" value={`${gstAmount} INR`} />
            </Stack>

            <Box sx={{ borderTop: border, pt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '1.4rem', fontWeight: 700, color: theme.palette.info.main }}>Total</Typography>
              <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: theme.palette.info.main }}>&#x20B9; {totalAmount}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function FieldLabel({ children }) {
  return (
    <Typography sx={{ mb: 0.75, fontSize: '0.82rem', color: 'text.primary' }}>
      {children}
    </Typography>
  );
}

function CheckoutToggleButton({ active, children, onClick }) {
  const theme = useTheme();

  return (
    <Button
      onClick={onClick}
      variant="outlined"
      sx={{
        borderRadius: 0,
        px: 2,
        py: 1,
        borderColor: theme.palette.info.main,
        color: active ? 'common.white' : theme.palette.info.main,
        bgcolor: active ? theme.palette.info.main : 'common.white',
        '&:hover': {
          borderColor: theme.palette.info.main,
          bgcolor: active ? theme.palette.info.main : alpha(theme.palette.info.main, 0.08)
        }
      }}
    >
      {children}
    </Button>
  );
}

function SummaryLine({ label, value }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
      <Typography sx={{ fontSize: '0.92rem', color: 'text.secondary' }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.92rem', color: 'text.primary' }}>{value}</Typography>
    </Box>
  );
}

export function FooterSection() {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'common.white', borderTop: `1px solid ${alpha(theme.palette.secondary.main, 0.12)}` }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ py: { xs: 5, md: 6 } }}>
          <Grid item xs={12} md={3}>
            <Logo to="/" logoHeight={82} />
            <Typography sx={{ mt: 1.5, maxWidth: 220, color: 'text.secondary', fontSize: '0.88rem' }}>
              A binding commitment since 1930.
            </Typography>
            <Stack direction="row" spacing={1.25} sx={{ mt: 3 }}>
              {socialIcons.map((Icon, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: '#121212',
                    color: 'common.white'
                  }}
                >
                  <Icon style={{ fontSize: 16 }} />
                </Box>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FooterLinkList items={['Home', 'What We Do', 'About Us']} />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FooterLinkList items={['Testimonials', 'Faq', 'Contact us']} />
          </Grid>

          <Grid item xs={12} md={2}>
            <Stack spacing={2}>
              <FooterContact icon={PhoneOutlined} title="Call" value="+ ( 91 ) 983 006 6537" />
              <FooterContact icon={MailOutlined} title="Email" value="contactus@dharbrothers.com" />
              <FooterContact icon={EnvironmentOutlined} title="Address" value="79, Lenin Sarani Rd, near COMMERCIAL POINT, Maula Ali, Taltala, Kolkata, West Bengal 700013" />
            </Stack>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography sx={{ fontSize: '1.35rem', fontWeight: 600, mb: 2 }}>Subscribe For The Latest News</Typography>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Email"
              slotProps={{
                input: {
                  disableUnderline: false
                }
              }}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{
                mt: 2.5,
                borderRadius: 0,
                bgcolor: theme.palette.warning.lighter,
                color: theme.palette.text.primary,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: theme.palette.warning.light,
                  boxShadow: 'none'
                }
              }}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </Container>

      <Box sx={{ bgcolor: 'info.main', color: 'common.white', py: 2 }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
            <Typography sx={{ fontSize: '0.82rem' }}>© 2026 Dhar Brothers. All Rights Reserved.</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.75, sm: 2.5 }}>
              <Typography sx={{ fontSize: '0.82rem' }}>Terms and Conditions</Typography>
              <Typography sx={{ fontSize: '0.82rem' }}>Privacy Policy</Typography>
              <Typography sx={{ fontSize: '0.82rem' }}>Refund Policy</Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

function FooterLinkList({ items }) {
  const linkMap = {
    Home: '/home',
    'What We Do': '/what-we-do',
    'About Us': '/about',
    Testimonials: '/home',
    Faq: '/faq',
    'Contact us': '/contact'
  };

  return (
    <Stack spacing={1.5}>
      {items.map((item) => {
        const to = linkMap[item];
        return to ? (
          <Typography
            key={item}
            component={RouterLink}
            to={to}
            sx={{ fontSize: '0.95rem', color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'info.main' } }}
          >
            {item}
          </Typography>
        ) : (
          <Typography key={item} sx={{ fontSize: '0.95rem', color: 'text.primary' }}>
            {item}
          </Typography>
        );
      })}
    </Stack>
  );
}

function FooterContact({ icon: Icon, title, value }) {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          border: `1px solid ${alpha(theme.palette.info.main, 0.22)}`,
          color: theme.palette.info.main,
          flexShrink: 0
        }}
      >
        <Icon style={{ fontSize: 16 }} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: '0.92rem', fontWeight: 600 }}>{title}</Typography>
        <Typography sx={{ fontSize: '0.84rem', color: 'text.secondary', lineHeight: 1.6 }}>{value}</Typography>
      </Box>
    </Stack>
  );
}
