/**
 * Minimal ambient type declaration for papaparse v5.
 *
 * This file exists because @types/papaparse is a devDependency and may not be
 * installed in production build environments (e.g. Vercel with NODE_ENV=production).
 * It covers exactly what FileUpload.tsx uses — no more, no less.
 *
 * If fuller types are ever needed, install @types/papaparse and delete this file.
 */

declare module "papaparse" {
  export interface ParseError {
    type: string;
    code: string;
    message: string;
    row?: number;
  }

  export interface ParseMeta {
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    truncated: boolean;
    cursor: number;
    fields?: string[];
  }

  export interface ParseResult<T = Record<string, unknown>> {
    data: T[];
    errors: ParseError[];
    meta: ParseMeta;
  }

  export interface ParseConfig<T = Record<string, unknown>> {
    header?: boolean;
    skipEmptyLines?: boolean | "greedy";
    dynamicTyping?: boolean;
    delimiter?: string;
    newline?: string;
    quoteChar?: string;
    escapeChar?: string;
    encoding?: string;
    worker?: boolean;
    comments?: boolean | string;
    step?: (results: ParseResult<T>, parser: unknown) => void;
    complete?: (results: ParseResult<T>, file?: File) => void;
    error?: (error: ParseError, file?: File) => void;
    download?: boolean;
    preview?: number;
    fastMode?: boolean;
    transform?: (value: string, field: string | number) => unknown;
  }

  const Papa: {
    parse<T = Record<string, unknown>>(
      input: string | File,
      config?: ParseConfig<T>
    ): ParseResult<T>;

    unparse(
      data: Record<string, unknown>[] | unknown[][],
      config?: {
        quotes?: boolean | boolean[];
        quoteChar?: string;
        escapeChar?: string;
        delimiter?: string;
        header?: boolean;
        newline?: string;
        skipEmptyLines?: boolean;
        columns?: string[];
      }
    ): string;

    RECORD_SEP: string;
    UNIT_SEP: string;
    BAD_DELIMITERS: string[];
    WORKERS_SUPPORTED: boolean;
    NODE_STREAM_INPUT: unique symbol;
  };

  export default Papa;
}
