import { Prisma, type PrismaClient, type Facility as PrismaFacility } from "@prisma/client";
import type { Facility, FacilityCategory, FacilityStatus } from "@/domain/entities/facility";
import type {
  CreateFacilityInput,
  FacilityRepository,
  UpdateFacilityInput
} from "../../application/ports/facility-repository";

const toDomain = (facility: PrismaFacility): Facility => ({
  id: facility.id,
  code: facility.code,
  name: facility.name,
  nameKana: facility.nameKana,
  category: facility.category as FacilityCategory,
  status: facility.status as FacilityStatus,
  startDate: facility.startDate,
  endDate: facility.endDate,
  country: facility.country,
  prefecture: facility.prefecture,
  city: facility.city,
  addressLine1: facility.addressLine1,
  postalCode: facility.postalCode,
  latitude: facility.latitude,
  longitude: facility.longitude,
  phoneNumber: facility.phoneNumber,
  email: facility.email,
  contactName: facility.contactName,
  contactPhone: facility.contactPhone,
  contactEmail: facility.contactEmail,
  capacity: facility.capacity,
  note: facility.note,
  imageUrl: facility.imageUrl,
  syncedAt: facility.syncedAt,
  createdBy: facility.createdBy,
  updatedBy: facility.updatedBy,
  createdAt: facility.createdAt,
  updatedAt: facility.updatedAt,
  isIntegrated: facility.isIntegrated,
  displayOrder: facility.displayOrder,
  billingCode: facility.billingCode
});

export class PrismaFacilityRepository implements FacilityRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Facility | null> {
    const facility = await this.prisma.facility.findUnique({ where: { id } });
    return facility ? toDomain(facility) : null;
  }

  async findAll(): Promise<Facility[]> {
    const facilities = await this.prisma.facility.findMany({
      orderBy: [
        { displayOrder: "asc" },
        { code: "asc" }
      ]
    });
    return facilities.map(toDomain);
  }

  async create(data: CreateFacilityInput): Promise<Facility> {
    try {
      const facility = await this.prisma.facility.create({
        data: {
          code: data.code,
          name: data.name,
          nameKana: data.nameKana ?? null,
          category: data.category,
          status: data.status,
          startDate: data.startDate ?? null,
          endDate: data.endDate ?? null,
          country: data.country ?? "JP",
          prefecture: data.prefecture ?? null,
          city: data.city ?? null,
          addressLine1: data.addressLine1 ?? null,
          postalCode: data.postalCode ?? null,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          phoneNumber: data.phoneNumber ?? null,
          email: data.email ?? null,
          contactName: data.contactName ?? null,
          contactPhone: data.contactPhone ?? null,
          contactEmail: data.contactEmail ?? null,
          capacity: data.capacity ?? null,
          note: data.note ?? null,
          imageUrl: data.imageUrl ?? null,
          syncedAt: data.syncedAt ?? null,
          createdBy: data.createdBy ?? null,
          updatedBy: data.updatedBy ?? null,
          isIntegrated: data.isIntegrated ?? false,
          displayOrder: data.displayOrder ?? null,
          billingCode: data.billingCode ?? null
        }
      });
      return toDomain(facility);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("FACILITY_CODE_EXISTS");
      }
      throw error;
    }
  }

  async update(id: string, data: UpdateFacilityInput): Promise<Facility> {
    try {
      const facility = await this.prisma.facility.update({
        where: { id },
        data: {
          name: data.name,
          nameKana: data.nameKana === undefined ? undefined : data.nameKana,
          category: data.category,
          status: data.status,
          startDate: data.startDate === undefined ? undefined : data.startDate,
          endDate: data.endDate === undefined ? undefined : data.endDate,
          country: data.country === undefined ? undefined : data.country,
          prefecture: data.prefecture === undefined ? undefined : data.prefecture,
          city: data.city === undefined ? undefined : data.city,
          addressLine1: data.addressLine1 === undefined ? undefined : data.addressLine1,
          postalCode: data.postalCode === undefined ? undefined : data.postalCode,
          latitude: data.latitude === undefined ? undefined : data.latitude,
          longitude: data.longitude === undefined ? undefined : data.longitude,
          phoneNumber: data.phoneNumber === undefined ? undefined : data.phoneNumber,
          email: data.email === undefined ? undefined : data.email,
          contactName: data.contactName === undefined ? undefined : data.contactName,
          contactPhone: data.contactPhone === undefined ? undefined : data.contactPhone,
          contactEmail: data.contactEmail === undefined ? undefined : data.contactEmail,
          capacity: data.capacity === undefined ? undefined : data.capacity,
          note: data.note === undefined ? undefined : data.note,
          imageUrl: data.imageUrl === undefined ? undefined : data.imageUrl,
          syncedAt: data.syncedAt === undefined ? undefined : data.syncedAt,
          updatedBy: data.updatedBy === undefined ? undefined : data.updatedBy,
          isIntegrated: data.isIntegrated === undefined ? undefined : data.isIntegrated,
          displayOrder: data.displayOrder === undefined ? undefined : data.displayOrder,
          billingCode: data.billingCode === undefined ? undefined : data.billingCode
        }
      });
      return toDomain(facility);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new Error("FACILITY_NOT_FOUND");
      }
      throw error;
    }
  }

  async deactivate(id: string, endDate: Date | null = null): Promise<Facility> {
    try {
      const facility = await this.prisma.facility.update({
        where: { id },
        data: {
          status: "INACTIVE",
          endDate,
          updatedAt: new Date()
        }
      });
      return toDomain(facility);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new Error("FACILITY_NOT_FOUND");
      }
      throw error;
    }
  }
}
