import type { Prisma } from "@prisma/client";

import { columnExists } from "@/lib/db-meta";
import { prisma } from "@/lib/prisma";

export type CatalogQuery = {
  q?: string;
  categorySlug?: string;
};

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
};

export type CatalogServiceItem = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  basePrice: number;
  estimatedMinutes: number;
  category: CatalogCategory;
};

export type CatalogSnapshot = {
  categories: CatalogCategory[];
  services: CatalogServiceItem[];
  activeCategory: CatalogCategory | null;
};

export type CatalogServiceDetail = CatalogServiceItem;

const categorySelect = {
  id: true,
  name: true,
  slug: true
} satisfies Prisma.CategorySelect;

function resolveOptionalImage(service: object): string | null {
  if (!("image" in service)) return null;
  return typeof service.image === "string" ? service.image : null;
}

function buildServiceWhere(
  query: string,
  activeCategory: CatalogCategory | null
): Prisma.ServiceWhereInput {
  return {
    ...(activeCategory ? { categoryId: activeCategory.id } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
            { category: { name: { contains: query } } }
          ]
        }
      : {})
  };
}

export async function getCatalogSnapshot({
  q,
  categorySlug
}: CatalogQuery = {}): Promise<CatalogSnapshot> {
  const query = (q ?? "").trim();
  const slug = (categorySlug ?? "").trim();

  const activeCategory = slug
    ? await prisma.category.findUnique({
        where: { slug },
        select: categorySelect
      })
    : null;

  const [categories, hasServiceImage] = await Promise.all([
    prisma.category.findMany({
      where: { active: true },
      select: categorySelect,
      orderBy: { name: "asc" }
    }),
    columnExists("Service", "image")
  ]);

  const where = buildServiceWhere(query, activeCategory);

  const services = hasServiceImage
    ? await prisma.service.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          basePrice: true,
          estimatedMinutes: true,
          category: { select: categorySelect }
        },
        orderBy: [{ category: { name: "asc" } }, { name: "asc" }]
      })
    : await prisma.service.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          basePrice: true,
          estimatedMinutes: true,
          category: { select: categorySelect }
        },
        orderBy: [{ category: { name: "asc" } }, { name: "asc" }]
      });

  return {
    categories,
    activeCategory,
    services: services.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      imageUrl: resolveOptionalImage(service),
      basePrice: service.basePrice,
      estimatedMinutes: service.estimatedMinutes,
      category: service.category
    }))
  };
}

export async function getCatalogServiceDetail(
  serviceId: string
): Promise<CatalogServiceDetail | null> {
  const hasServiceImage = await columnExists("Service", "image");

  const service = hasServiceImage
    ? await prisma.service.findUnique({
        where: { id: serviceId },
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          basePrice: true,
          estimatedMinutes: true,
          category: { select: categorySelect }
        }
      })
    : await prisma.service.findUnique({
        where: { id: serviceId },
        select: {
          id: true,
          name: true,
          description: true,
          basePrice: true,
          estimatedMinutes: true,
          category: { select: categorySelect }
        }
      });

  if (!service) return null;

  return {
    id: service.id,
    name: service.name,
    description: service.description,
    imageUrl: resolveOptionalImage(service),
    basePrice: service.basePrice,
    estimatedMinutes: service.estimatedMinutes,
    category: service.category
  };
}
