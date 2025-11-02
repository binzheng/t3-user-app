import { randomUUID } from "node:crypto";
import { describe, it, expect, beforeEach } from "vitest";
import {
  FACILITY_CATEGORIES,
  FACILITY_STATUSES,
  type Facility
} from "@/domain/entities/facility";
import type {
  CreateFacilityInput,
  FacilityRepository,
  UpdateFacilityInput
} from "@/server/application/ports/facility-repository";
import { CreateFacilityUseCase } from "@/server/application/use-cases/create-facility";
import { ListFacilitiesUseCase } from "@/server/application/use-cases/list-facilities";
import { UpdateFacilityUseCase } from "@/server/application/use-cases/update-facility";
import { DeactivateFacilityUseCase } from "@/server/application/use-cases/deactivate-facility";

class InMemoryFacilityRepository implements FacilityRepository {
  private facilities: Facility[] = [];

  constructor(initial: Facility[] = []) {
    this.facilities = [...initial];
  }

  async findById(id: string): Promise<Facility | null> {
    return this.facilities.find((facility) => facility.id === id) ?? null;
  }

  async findAll(): Promise<Facility[]> {
    return [...this.facilities];
  }

  async create(data: CreateFacilityInput): Promise<Facility> {
    const exists = this.facilities.some((facility) => facility.code === data.code);
    if (exists) {
      throw new Error("FACILITY_CODE_EXISTS");
    }

    const now = new Date();
    const facility: Facility = {
      id: randomUUID(),
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
      createdAt: now,
      updatedAt: now,
      isIntegrated: data.isIntegrated ?? false,
      displayOrder: data.displayOrder ?? null,
      billingCode: data.billingCode ?? null
    };

    this.facilities.push(facility);
    return facility;
  }

  async update(id: string, data: UpdateFacilityInput): Promise<Facility> {
    const target = this.facilities.find((facility) => facility.id === id);
    if (!target) {
      throw new Error("FACILITY_NOT_FOUND");
    }

    const updated: Facility = {
      ...target,
      name: data.name ?? target.name,
      nameKana: data.nameKana === undefined ? target.nameKana ?? null : data.nameKana,
      category: data.category ?? target.category,
      status: data.status ?? target.status,
      startDate: data.startDate === undefined ? target.startDate ?? null : data.startDate,
      endDate: data.endDate === undefined ? target.endDate ?? null : data.endDate,
      country: data.country === undefined ? target.country ?? null : data.country,
      prefecture: data.prefecture === undefined ? target.prefecture ?? null : data.prefecture,
      city: data.city === undefined ? target.city ?? null : data.city,
      addressLine1: data.addressLine1 === undefined ? target.addressLine1 ?? null : data.addressLine1,
      postalCode: data.postalCode === undefined ? target.postalCode ?? null : data.postalCode,
      latitude: data.latitude === undefined ? target.latitude ?? null : data.latitude,
      longitude: data.longitude === undefined ? target.longitude ?? null : data.longitude,
      phoneNumber: data.phoneNumber === undefined ? target.phoneNumber ?? null : data.phoneNumber,
      email: data.email === undefined ? target.email ?? null : data.email,
      contactName: data.contactName === undefined ? target.contactName ?? null : data.contactName,
      contactPhone:
        data.contactPhone === undefined ? target.contactPhone ?? null : data.contactPhone,
      contactEmail:
        data.contactEmail === undefined ? target.contactEmail ?? null : data.contactEmail,
      capacity: data.capacity === undefined ? target.capacity ?? null : data.capacity,
      note: data.note === undefined ? target.note ?? null : data.note,
      imageUrl: data.imageUrl === undefined ? target.imageUrl ?? null : data.imageUrl,
      syncedAt: data.syncedAt === undefined ? target.syncedAt ?? null : data.syncedAt,
      updatedBy: data.updatedBy === undefined ? target.updatedBy ?? null : data.updatedBy,
      isIntegrated: data.isIntegrated === undefined ? target.isIntegrated : data.isIntegrated,
      displayOrder: data.displayOrder === undefined ? target.displayOrder ?? null : data.displayOrder,
      billingCode: data.billingCode === undefined ? target.billingCode ?? null : data.billingCode,
      updatedAt: new Date()
    };

    this.facilities = this.facilities.map((facility) => (facility.id === id ? updated : facility));
    return updated;
  }

  async deactivate(id: string, endDate: Date | null = null): Promise<Facility> {
    const target = this.facilities.find((facility) => facility.id === id);
    if (!target) {
      throw new Error("FACILITY_NOT_FOUND");
    }
    const updated: Facility = {
      ...target,
      status: FACILITY_STATUSES.INACTIVE,
      endDate,
      updatedAt: new Date()
    };
    this.facilities = this.facilities.map((facility) => (facility.id === id ? updated : facility));
    return updated;
  }
}

describe("Facility use cases", () => {
  let repo: InMemoryFacilityRepository;

  beforeEach(() => {
    repo = new InMemoryFacilityRepository();
  });

  const baseFacility: CreateFacilityInput = {
    code: "FC-001",
    name: "テスト施設",
    category: FACILITY_CATEGORIES.HEAD,
    status: FACILITY_STATUSES.ACTIVE
  };

  it("creates a facility successfully", async () => {
    const useCase = new CreateFacilityUseCase(repo);

    const facility = await useCase.execute(baseFacility);

    expect(facility.id).toBeDefined();
    expect(facility.code).toBe("FC-001");

    const list = await repo.findAll();
    expect(list).toHaveLength(1);
  });

  it("throws when creating a facility with duplicate code", async () => {
    const useCase = new CreateFacilityUseCase(repo);
    await useCase.execute(baseFacility);

    await expect(
      useCase.execute({
        ...baseFacility,
        name: "別施設"
      })
    ).rejects.toThrowError(/FACILITY_CODE_EXISTS/);
  });

  it("updates an existing facility", async () => {
    const createUseCase = new CreateFacilityUseCase(repo);
    const created = await createUseCase.execute(baseFacility);

    const updateUseCase = new UpdateFacilityUseCase(repo);
    const updated = await updateUseCase.execute(created.id, {
      name: "更新済み施設",
      status: FACILITY_STATUSES.SUSPENDED,
      prefecture: "東京都",
      capacity: 200
    });

    expect(updated.name).toBe("更新済み施設");
    expect(updated.status).toBe(FACILITY_STATUSES.SUSPENDED);
    expect(updated.prefecture).toBe("東京都");
    expect(updated.capacity).toBe(200);
  });

  it("deactivates a facility", async () => {
    const createUseCase = new CreateFacilityUseCase(repo);
    const created = await createUseCase.execute(baseFacility);

    const deactivateUseCase = new DeactivateFacilityUseCase(repo);
    const endDate = new Date("2024-01-31T00:00:00Z");
    const updated = await deactivateUseCase.execute(created.id, endDate);

    expect(updated.status).toBe(FACILITY_STATUSES.INACTIVE);
    expect(updated.endDate?.toISOString()).toBe(endDate.toISOString());
  });

  it("throws when updating non-existing facility", async () => {
    const updateUseCase = new UpdateFacilityUseCase(repo);

    await expect(
      updateUseCase.execute(randomUUID(), {
        name: "not found"
      })
    ).rejects.toThrowError(/FACILITY_NOT_FOUND/);
  });

  it("throws when deactivating non-existing facility", async () => {
    const deactivateUseCase = new DeactivateFacilityUseCase(repo);

    await expect(deactivateUseCase.execute(randomUUID())).rejects.toThrowError(/FACILITY_NOT_FOUND/);
  });

  it("lists facilities in insertion order", async () => {
    const createUseCase = new CreateFacilityUseCase(repo);
    await createUseCase.execute(baseFacility);
    await createUseCase.execute({
      ...baseFacility,
      code: "FC-002",
      name: "追加施設"
    });

    const listUseCase = new ListFacilitiesUseCase(repo);
    const facilities = await listUseCase.execute();
    expect(facilities).toHaveLength(2);
    expect(facilities.map((facility) => facility.code)).toEqual(["FC-001", "FC-002"]);
  });
});
