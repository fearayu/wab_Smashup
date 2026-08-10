import type { ResponseStandard } from '@/models'

export async function responseHandler(data: any, response: Response | null) {
  // The response body has already been parsed by useApi's afterFetch
  // So we should use the data directly instead of trying to read response.json() again
  const parsedData = data.value

  const result: ResponseStandard = {
    ok: response?.status === 200 ? parsedData.ok : parsedData?.ok ?? false,
    data: response?.status === 200 ? (parsedData.data as any) : undefined,
    error: response?.status !== 200 ? parsedData?.error : undefined,
  }

  return result
}
