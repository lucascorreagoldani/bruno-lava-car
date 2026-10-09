export interface InvalidParam {
  name: string;
  reason: string;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  invalidParams?: InvalidParam[];
  statusCode: number;
  error: string;
  message: string;
  details?: Array<{ field?: string; message: string }>;
}

export function createProblemDetails(params: {
  typeUri: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errorCode: string;
  invalidParams?: InvalidParam[];
  details?: Array<{ field?: string; message: string }>;
}): ProblemDetails {
  return {
    type: `https://api.brunolavacar.com/errors/${params.typeUri}`,
    title: params.title,
    status: params.status,
    detail: params.detail,
    instance: params.instance,
    invalidParams: params.invalidParams ?? [],
    statusCode: params.status,
    error: params.errorCode,
    message: params.detail,
    details: params.details ?? []
  };
}
