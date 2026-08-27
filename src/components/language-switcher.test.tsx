import { NextIntlClientProvider, useTranslations } from "next-intl";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as localeClient from "@/i18n/client";
import { LanguageSwitcher } from "@/components/language-switcher";
import { loadMessages } from "@/i18n/messages";

const { mockedRefresh } = vi.hoisted(() => ({
  mockedRefresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockedRefresh,
  }),
}));

function LanguageCopy() {
  const t = useTranslations("language");

  return <p>{t("change")}</p>;
}

function renderSwitcher(locale: "en" | "id") {
  return render(
    <NextIntlClientProvider locale={locale} messages={loadMessages(locale)}>
      <LanguageSwitcher />
      <LanguageCopy />
    </NextIntlClientProvider>,
  );
}

describe("LanguageSwitcher", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mockedRefresh.mockClear();
  });

  it("switches Indonesian to English", async () => {
    const persistLocaleSpy = vi.spyOn(localeClient, "persistLocale");
    const { rerender } = renderSwitcher("id");

    expect(screen.getByText("Ubah bahasa")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Ubah bahasa" }),
    );

    expect(screen.getByRole("menuitem", { name: "English" })).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Bahasa Indonesia" }),
    ).toHaveAttribute("aria-current", "true");

    fireEvent.click(screen.getByRole("menuitem", { name: "English" }));

    await waitFor(() => {
      expect(persistLocaleSpy).toHaveBeenCalledWith("en");
      expect(mockedRefresh).toHaveBeenCalledTimes(1);
    });

    rerender(
      <NextIntlClientProvider locale="en" messages={loadMessages("en")}>
        <LanguageSwitcher />
        <LanguageCopy />
      </NextIntlClientProvider>,
    );

    expect(screen.getByText("Change language")).toBeInTheDocument();
  });

  it("switches English to Indonesian", async () => {
    const persistLocaleSpy = vi.spyOn(localeClient, "persistLocale");
    renderSwitcher("en");

    fireEvent.click(screen.getByRole("button", { name: "Change language" }));
    fireEvent.click(
      screen.getByRole("menuitem", { name: "Bahasa Indonesia" }),
    );

    await waitFor(() => {
      expect(persistLocaleSpy).toHaveBeenCalledWith("id");
      expect(mockedRefresh).toHaveBeenCalledTimes(1);
    });
  });
});
