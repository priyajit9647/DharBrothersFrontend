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
import { BindingPrintDetailsCard, SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS } from '../PlaceOrder';

export default function SynopsisStep({
  printTitle,
  coverMaterials,
  masterOptions,
  masterError,
  a4PocketsLabel,
  cdPocketsLabel,
  showCdPockets,
  bindingConfig,
  onBindingConfigChange,
  synopsisCoverPageType,
  onChangeSynopsisCoverPageType,
  synopsisCoverPageDesignFile,
  onSynopsisCoverPageDesignFileChange,
  bindingSelectionError,
  setBindingSelectionError
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

  const handleCoverDesignFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    onSynopsisCoverPageDesignFileChange(file);
    event.target.value = '';
  };

  const handleChangeSynopsisCoverPageType = (type) => {
    setBindingSelectionError(null);
    onChangeSynopsisCoverPageType(type);
  }

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
          <Typography sx={{ fontSize: '0.98rem', fontWeight: 600, mb: 2 }}>Cover Page Design</Typography>

          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  variant={synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.upload_new_design ? 'contained' : 'outlined'}
                  onClick={() => handleChangeSynopsisCoverPageType(SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.upload_new_design)}
                  aria-pressed={synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.upload_new_design}
                  sx={{
                    borderRadius: 0,
                    px: 2.5,
                    py: 0.8,
                    bgcolor: synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.upload_new_design ? '#13c2c2' : 'common.white',
                    color: synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.upload_new_design ? 'common.white' : 'text.primary',
                    borderColor: synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.upload_new_design ? '#13c2c2' : alpha(theme.palette.secondary.main, 0.4),
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
                <Button
                  variant={synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.same_as_hard_binding_conver ? 'contained' : 'outlined'}
                  onClick={() => handleChangeSynopsisCoverPageType(SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.same_as_hard_binding_conver)}
                  aria-pressed={synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.same_as_hard_binding_conver}
                  sx={{
                    borderRadius: 0,
                    px: 2.5,
                    py: 0.8,
                    bgcolor: synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.same_as_hard_binding_conver ? '#13c2c2' : 'common.white',
                    color: synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.same_as_hard_binding_conver ? 'common.white' : 'text.primary',
                    borderColor: synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.same_as_hard_binding_conver ? '#13c2c2' : alpha(theme.palette.secondary.main, 0.4),
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: theme.palette.warning.light,
                      color: 'text.primary',
                      borderColor: theme.palette.warning.light,
                      boxShadow: 'none'
                    }
                  }}
                >
                  Same as Hard Binding Cover
                </Button>
                <Button
                  variant={synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.same_as_soft_binding_conver ? 'contained' : 'outlined'}
                  onClick={() => handleChangeSynopsisCoverPageType(SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.same_as_soft_binding_conver)}
                  aria-pressed={synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.same_as_soft_binding_conver}
                  sx={{
                    borderRadius: 0,
                    px: 2.5,
                    py: 0.8,
                    bgcolor: synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.same_as_soft_binding_conver ? '#13c2c2' : 'common.white',
                    color: synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.same_as_soft_binding_conver ? 'common.white' : 'text.primary',
                    borderColor: synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.same_as_soft_binding_conver ? '#13c2c2' : alpha(theme.palette.secondary.main, 0.4),
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: theme.palette.warning.light,
                      color: 'text.primary',
                      borderColor: theme.palette.warning.light,
                      boxShadow: 'none'
                    }
                  }}
                >
                  Same as Soft Binding Cover
                </Button>
                <Button
                  variant={synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.do_not_need_cover_printing ? 'contained' : 'outlined'}
                  onClick={() => handleChangeSynopsisCoverPageType(SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.do_not_need_cover_printing)}
                  aria-pressed={synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.do_not_need_cover_printing}
                  sx={{
                    borderRadius: 0,
                    px: 2.5,
                    py: 0.8,
                    bgcolor: synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.do_not_need_cover_printing ? '#13c2c2' : 'common.white',
                    color: synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.do_not_need_cover_printing ? 'common.white' : 'text.primary',
                    borderColor: synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.do_not_need_cover_printing ? '#13c2c2' : alpha(theme.palette.secondary.main, 0.4),
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: theme.palette.warning.light,
                      color: 'text.primary',
                      borderColor: theme.palette.warning.light,
                      boxShadow: 'none'
                    }
                  }}
                >
                  Don't Need Cover Printing
                </Button>
              </Stack>

              {synopsisCoverPageType == SYNOPSIS_COVER_PAGE_DEGIN_OPTIONS.upload_new_design ? (
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
                      {synopsisCoverPageDesignFile ? synopsisCoverPageDesignFile?.name : 'Upload New Design'}
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

            </Grid>
          </Grid>

          {bindingSelectionError ? (
            <Typography sx={{ mt: 1.5, fontSize: '0.84rem', color: 'error.main' }}>{bindingSelectionError}</Typography>
           ) : (
            <Typography sx={{ mt: 1.5, fontSize: '0.82rem', color: 'text.secondary' }}>
                Select Atleast one Cover Page Design Type for Synopsis
            </Typography>
           )}
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