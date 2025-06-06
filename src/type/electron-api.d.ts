import type { OpenDialogOptions } from 'electron';

export type PathInputs = {
  testedPath: string;
  untestedPath: string;
  planPath: string;
};

declare global {
  interface Window {
    electronAPI: {
      pickFile: (options: OpenDialogOptions) => Promise<string | null>;
      getAllStatuses: (paths: PathInputs) => Promise<any>;
    };
  }
}

export {};