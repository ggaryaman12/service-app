import {
  getCatalogServiceDetail,
  getCatalogSnapshot,
  type CatalogQuery
} from "./catalog.service";

export type OpenCatalogResponse = {
  data: Awaited<ReturnType<typeof getCatalogSnapshot>>;
  meta: {
    version: "v1";
    currency: "INR";
    paymentMode: "COD";
  };
};

export async function getOpenCatalogController(
  query: CatalogQuery
): Promise<OpenCatalogResponse> {
  const data = await getCatalogSnapshot(query);

  return {
    data,
    meta: {
      version: "v1",
      currency: "INR",
      paymentMode: "COD"
    }
  };
}

export type OpenCatalogServiceResponse = {
  data: Awaited<ReturnType<typeof getCatalogServiceDetail>>;
  meta: {
    version: "v1";
    currency: "INR";
    paymentMode: "COD";
  };
};

export async function getOpenCatalogServiceController(
  serviceId: string
): Promise<OpenCatalogServiceResponse> {
  const data = await getCatalogServiceDetail(serviceId);

  return {
    data,
    meta: {
      version: "v1",
      currency: "INR",
      paymentMode: "COD"
    }
  };
}
