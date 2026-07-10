import { Package, Settings, FileText, Printer, BookOpen, CheckCircle, Truck } from 'lucide-react';

const STAGE_ICON_MAP = {
  'Order-Created': Package,
  'Order-Processing': Settings,
  'Document-Edit-Stage': FileText,
  'Printing-Done': Printer,
  'Binding-Done': BookOpen,
  'Order-Ready-Check': CheckCircle,
  'Ready-To-Dispatch': Truck,
  'Ready-To-Print': Printer,
  'Order-Complete': CheckCircle
};

function resolveStageIconComponent(stageName) {
  if (!stageName) return CheckCircle;

  const exact = STAGE_ICON_MAP[stageName];
  if (exact) return exact;

  const normalized = String(stageName).toLowerCase();
  if (normalized.includes('created')) return Package;
  if (normalized.includes('process')) return Settings;
  if (normalized.includes('document') || normalized.includes('edit')) return FileText;
  if (normalized.includes('print')) return Printer;
  if (normalized.includes('bind')) return BookOpen;
  if (normalized.includes('dispatch') || normalized.includes('deliver')) return Truck;
  if (normalized.includes('ready') || normalized.includes('complete')) return CheckCircle;

  return CheckCircle;
}

export function renderTimelineStageIcon(stageName, iconProps = { color: '#fff', size: 20 }) {
  const Icon = resolveStageIconComponent(stageName);
  return <Icon {...iconProps} />;
}

export function formatTimelineStageStatus(stage) {
  const updatedBy = stage?.updatedBy ? String(stage.updatedBy).trim() : '';
  const remarks = stage?.remarks ? String(stage.remarks).trim() : '';

  if (updatedBy && remarks) return `${updatedBy}: ${remarks}`;
  if (updatedBy) return updatedBy;
  if (remarks) return remarks;
  return 'No remarks available';
}

function normalizeStageName(stage) {
  return String(stage?.stageName || stage?.name || '').trim().toLowerCase();
}

export function isTimelineCompleteStage(stage, { currentStage, isLastStage } = {}) {
  const stageName = normalizeStageName(stage);
  if (stageName === 'order-complete' || stageName.endsWith('-complete')) {
    return true;
  }

  const current = String(currentStage || '').trim().toLowerCase();
  return Boolean(isLastStage && current === 'order-complete');
}

export function isTimelineStageActive(stage, options = {}) {
  if (stage?.isCompleted) return true;
  return isTimelineCompleteStage(stage, options);
}

export function getTimelineStageChipLabel(stage, options = {}) {
  if (isTimelineCompleteStage(stage, options)) {
    return 'Complete';
  }

  if (stage?.isCompleted) {
    return 'Completed';
  }

  return 'Pending';
}
