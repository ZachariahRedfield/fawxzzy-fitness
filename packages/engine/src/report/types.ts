export type VerifyFailure = {
  id: string;
  message: string;
  evidence?: string;
  fix?: string;
};

export type VerifyWarning = {
  id: string;
  message: string;
};

export type VerifyReport = {
  ok: boolean;
  summary: {
    failures: number;
    warnings: number;
    baseRef?: string;
    baseSha?: string;
  };
  failures: VerifyFailure[];
  warnings: VerifyWarning[];
};
