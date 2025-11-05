import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserTable } from "@/presentation/components/user";
import { trpc } from "@/infrastructure/trpc/client";

vi.mock("@/infrastructure/trpc/client", () => {
  const utils = {
    user: {
      list: {
        invalidate: vi.fn()
      }
    }
  };

  const base = {
    Provider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    useUtils: () => utils,
    user: {
      list: {
        useQuery: vi.fn()
      },
      create: {
        useMutation: vi.fn()
      },
      update: {
        useMutation: vi.fn()
      },
      delete: {
        useMutation: vi.fn()
      }
    }
  };

  return {
    trpc: base
  };
});

describe("UserTable component", () => {
  const mockedTrpc = trpc as unknown as {
    Provider: React.ComponentType<{ children: React.ReactNode }>;
    useUtils: () => { user: { list: { invalidate: ReturnType<typeof vi.fn> } } };
    user: {
      list: {
        useQuery: ReturnType<typeof vi.fn> & ((...args: any[]) => any);
      };
      create: {
        useMutation: ReturnType<typeof vi.fn> & ((...args: any[]) => any);
      };
      update: {
        useMutation: ReturnType<typeof vi.fn> & ((...args: any[]) => any);
      };
      delete: {
        useMutation: ReturnType<typeof vi.fn> & ((...args: any[]) => any);
      };
    };
  };

  const setupTrpcMocks = () => {
    const listMock = vi.fn().mockReturnValue({
      data: [
        {
          id: "1",
          email: "user1@example.com",
          name: "ユーザー1",
          nameKana: "ユーザーイチ",
          role: "USER",
          status: "ACTIVE",
          department: "営業部",
          title: "マネージャー",
          phoneNumber: "03-1234-5678",
          image: "https://example.com/avatar.png",
          note: "メモ",
          lastLoginAt: null,
          mfaEnabled: false,
          isLocked: false,
          createdBy: "admin",
          updatedBy: "admin",
          createdAt: new Date("2023-01-01T00:00:00Z"),
          updatedAt: new Date("2023-01-02T00:00:00Z")
        }
      ],
      isLoading: false,
      isFetching: false,
      refetch: vi.fn()
    });

    const createMock = vi.fn().mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isLoading: false,
      isError: false,
      error: null
    });

    const updateMock = vi.fn().mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isLoading: false,
      isError: false,
      error: null
    });

    const deleteMock = vi.fn().mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
      isError: false,
      error: null
    });

    mockedTrpc.user.list.useQuery = listMock;
    mockedTrpc.user.create.useMutation = createMock;
    mockedTrpc.user.update.useMutation = updateMock;
    mockedTrpc.user.delete.useMutation = deleteMock;

    return { listMock, createMock, updateMock, deleteMock };
  };

  const renderComponent = () => {
    const queryClient = new QueryClient();

    return render(
      <mockedTrpc.Provider>
        <QueryClientProvider client={queryClient}>
          <UserTable />
        </QueryClientProvider>
      </mockedTrpc.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays user list", async () => {
    const { listMock } = setupTrpcMocks();
    renderComponent();

    expect(listMock).toHaveBeenCalled();
    expect(await screen.findByText("ユーザー1")).toBeInTheDocument();
    expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    expect(screen.getByText("営業部")).toBeInTheDocument();
  });

  it("opens create dialog and submits", async () => {
    const { createMock } = setupTrpcMocks();
    const mutateSpy = vi.fn().mockResolvedValue(undefined);
    createMock.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: mutateSpy,
      isLoading: false,
      isError: false,
      error: null
    });

    renderComponent();

    fireEvent.click(screen.getByText("ユーザー追加"));
    fireEvent.change(screen.getByLabelText("氏名"), { target: { value: "新規ユーザー" } });
    fireEvent.change(screen.getByLabelText("メールアドレス"), {
      target: { value: "new@example.com" }
    });

    fireEvent.click(screen.getByText("保存"));

    await waitFor(() => {
      expect(mutateSpy).toHaveBeenCalled();
    });

    const payload = mutateSpy.mock.calls[0][0];
    expect(payload).toMatchObject({
      email: "new@example.com",
      name: "新規ユーザー",
      role: "USER",
      status: "INVITED"
    });
    expect(payload).toEqual(
      expect.objectContaining({
        nameKana: undefined,
        department: undefined,
        title: undefined,
        phoneNumber: undefined,
        image: undefined,
        note: undefined
      })
    );
  });

  it("opens edit dialog and submits update", async () => {
    const { listMock, updateMock } = setupTrpcMocks();
    const mutateSpy = vi.fn().mockResolvedValue(undefined);
    updateMock.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: mutateSpy,
      isLoading: false,
      isError: false,
      error: null
    });

    renderComponent();

    fireEvent.click(screen.getByLabelText("edit"));
    fireEvent.change(screen.getByLabelText("氏名"), { target: { value: "更新ユーザー" } });

    fireEvent.click(screen.getByText("更新"));

    await waitFor(() => {
      expect(mutateSpy).toHaveBeenCalled();
    });

    const payload = mutateSpy.mock.calls[0][0];
    expect(payload).toMatchObject({
      id: "1",
      name: "更新ユーザー",
      role: "USER",
      status: "ACTIVE",
      nameKana: "ユーザーイチ",
      department: "営業部",
      title: "マネージャー",
      phoneNumber: "03-1234-5678",
      note: "メモ",
      image: "https://example.com/avatar.png"
    });

    expect(listMock).toHaveBeenCalled();
  });

  it("calls delete mutation", async () => {
    const { deleteMock } = setupTrpcMocks();
    const mutateSpy = vi.fn();
    deleteMock.mockReturnValue({
      mutate: mutateSpy,
      isLoading: false,
      isError: false,
      error: null
    });

    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderComponent();

    fireEvent.click(screen.getByLabelText("delete"));

    await waitFor(() => {
      expect(mutateSpy).toHaveBeenCalledWith({ id: "1" });
    });
  });
});
