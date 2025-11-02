import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FacilityTable } from "@/presentation/components/facility";
import { trpc } from "@/infrastructure/trpc/client";

vi.mock("@/infrastructure/trpc/client", () => {
  const utils = {
    facility: {
      list: {
        invalidate: vi.fn()
      }
    }
  };

  const base = {
    Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useUtils: () => utils,
    facility: {
      list: {
        useQuery: vi.fn()
      },
      create: {
        useMutation: vi.fn()
      },
      update: {
        useMutation: vi.fn()
      },
      deactivate: {
        useMutation: vi.fn()
      }
    }
  };

  return {
    trpc: base
  };
});

describe("FacilityTable component", () => {
  const mockedTrpc = trpc as unknown as {
    Provider: React.ComponentType<{ children: React.ReactNode }>;
    useUtils: () => { facility: { list: { invalidate: ReturnType<typeof vi.fn> } } };
    facility: {
      list: { useQuery: ReturnType<typeof vi.fn> & ((...args: any[]) => any) };
      create: { useMutation: ReturnType<typeof vi.fn> & ((...args: any[]) => any) };
      update: { useMutation: ReturnType<typeof vi.fn> & ((...args: any[]) => any) };
      deactivate: { useMutation: ReturnType<typeof vi.fn> & ((...args: any[]) => any) };
    };
  };

  const setupMocks = () => {
    const listMock = vi.fn().mockReturnValue({
      data: [
        {
          id: "fac-1",
          code: "FC-001",
          name: "テスト施設",
          nameKana: "テストシセツ",
          category: "HEAD",
          status: "ACTIVE",
          prefecture: "東京都",
          city: "千代田区",
          addressLine1: "1-1-1",
          postalCode: "100-0001",
          phoneNumber: "03-0000-0000",
          email: "facility@example.com",
          contactName: "担当 太郎",
          contactPhone: "03-9999-9999",
          contactEmail: "contact@example.com",
          startDate: new Date("2024-01-01T00:00:00Z"),
          endDate: null,
          capacity: 100,
          note: "メモ",
          imageUrl: null,
          displayOrder: 1,
          isIntegrated: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      isLoading: false,
      isFetching: false,
      refetch: vi.fn()
    });

    const createMock = vi.fn().mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
      isError: false,
      error: null
    });

    const updateMock = vi.fn().mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
      isError: false,
      error: null
    });

    const deactivateMock = vi.fn().mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
      isError: false,
      error: null
    });

    mockedTrpc.facility.list.useQuery = listMock;
    mockedTrpc.facility.create.useMutation = createMock;
    mockedTrpc.facility.update.useMutation = updateMock;
    mockedTrpc.facility.deactivate.useMutation = deactivateMock;

    return { listMock, createMock, updateMock, deactivateMock };
  };

  const renderComponent = () => {
    const queryClient = new QueryClient();
    return render(
      <mockedTrpc.Provider>
        <QueryClientProvider client={queryClient}>
          <FacilityTable />
        </QueryClientProvider>
      </mockedTrpc.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays facility list", async () => {
    const { listMock } = setupMocks();
    renderComponent();

    expect(listMock).toHaveBeenCalled();
    expect(await screen.findByText("テスト施設")).toBeInTheDocument();
    expect(screen.getByText("FC-001")).toBeInTheDocument();
    expect(screen.getByText("担当 太郎")).toBeInTheDocument();
  });

  it("opens create dialog and submits payload", async () => {
    const { createMock } = setupMocks();
    const mutateSpy = vi.fn();
    createMock.mockReturnValue({
      mutate: mutateSpy,
      isLoading: false,
      isError: false,
      error: null
    });

    renderComponent();

    fireEvent.click(screen.getByText("施設追加"));
    fireEvent.change(screen.getByLabelText("施設コード"), { target: { value: "FC-002" } });
    fireEvent.change(screen.getByLabelText("施設名称"), { target: { value: "新規施設" } });
    fireEvent.change(screen.getByLabelText("都道府県"), { target: { value: "神奈川県" } });

    fireEvent.click(screen.getByText("保存"));

    await waitFor(() => {
      expect(mutateSpy).toHaveBeenCalled();
    });

    const payload = mutateSpy.mock.calls[0][0];
    expect(payload).toMatchObject({
      code: "FC-002",
      name: "新規施設",
      prefecture: "神奈川県"
    });
  });

  it("opens edit dialog and submits update", async () => {
    const { updateMock } = setupMocks();
    const mutateSpy = vi.fn();
    updateMock.mockReturnValue({
      mutate: mutateSpy,
      isLoading: false,
      isError: false,
      error: null
    });

    renderComponent();

    fireEvent.click(screen.getByLabelText("edit"));
    fireEvent.change(screen.getByLabelText("施設名称"), { target: { value: "更新施設" } });

    fireEvent.click(screen.getByText("更新"));

    await waitFor(() => {
      expect(mutateSpy).toHaveBeenCalled();
    });

    const payload = mutateSpy.mock.calls[0][0];
    expect(payload).toMatchObject({
      id: "fac-1",
      name: "更新施設"
    });
  });

  it("deactivates facility", async () => {
    const { deactivateMock } = setupMocks();
    const mutateSpy = vi.fn();
    deactivateMock.mockReturnValue({
      mutate: mutateSpy,
      isLoading: false,
      isError: false,
      error: null
    });

    renderComponent();

    vi.spyOn(window, "confirm").mockReturnValue(true);
    fireEvent.click(screen.getByLabelText("deactivate"));

    await waitFor(() => {
      expect(mutateSpy).toHaveBeenCalled();
    });

    const payload = mutateSpy.mock.calls[0][0];
    expect(payload).toMatchObject({
      id: "fac-1"
    });
  });
});
