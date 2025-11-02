import type { Facility, FacilityCategory, FacilityStatus } from "@/domain/entities/facility";

export const filterFacilities = (
  facilities: Facility[],
  keyword: string,
  category: "ALL" | FacilityCategory,
  status: "ALL" | FacilityStatus
) => {
  const normalized = keyword.trim().toLowerCase();
  return facilities.filter((facility) => {
    const matchKeyword = normalized
      ? [
          facility.name,
          facility.code,
          facility.prefecture ?? "",
          facility.city ?? "",
          facility.contactName ?? ""
        ].some((value) => value.toLowerCase().includes(normalized))
      : true;
    const matchCategory = category === "ALL" ? true : facility.category === category;
    const matchStatus = status === "ALL" ? true : facility.status === status;
    return matchKeyword && matchCategory && matchStatus;
  });
};

export const paginate = <T,>(items: T[], page: number, rowsPerPage: number) => {
  const start = page * rowsPerPage;
  return items.slice(start, start + rowsPerPage);
};

export const buildCsvContent = (rows: string[][]): string =>
  rows
    .map((columns) =>
      columns
        .map((col) => {
          const value = String(col ?? "").replace(/"/g, '""');
          return `"${value}"`;
        })
        .join(",")
    )
    .join("\n");
