export interface ProgressNote {
  readonly kind: 'stale' | 'unsaved';
  readonly onDownload: () => void;
  readonly onDiscard: () => void;
}

export interface DemoState {
  readonly show: boolean;
  readonly resetShow: boolean;
  readonly on: boolean;
  readonly locked: boolean;
  readonly hasWork: boolean;
}

export interface DemoProps {
  readonly demo: DemoState;
  readonly onDemo: (demo: boolean) => void;
  readonly onReset: () => void;
  readonly onDownloadRun?: () => void;
}

export interface ProgressActions {
  readonly onDownload: () => void;
  readonly onUpload: (yaml: string) => void;
}
