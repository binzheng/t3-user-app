import type { UserRole, User } from "@/domain/entities/user";

export const filterUsers = (users: User[], keyword: string, role: "ALL" | UserRole) => {
  const normalized = keyword.trim().toLowerCase();
  return users.filter((user) => {
    const matchKeyword = normalized
      ? [user.name, user.email, user.department ?? "", user.title ?? ""].some((value) =>
          value.toLowerCase().includes(normalized)
        )
      : true;
    const matchRole = role === "ALL" ? true : user.role === role;
    return matchKeyword && matchRole;
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
