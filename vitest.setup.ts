import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// テスト後にクリーンアップ
afterEach(() => {
  cleanup();
});

// jsdom環境でのみmatchMediaをモック
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });
}
