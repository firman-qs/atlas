import {NextIntlClientProvider, type AbstractIntlMessages} from "next-intl";
import {
  render as testingLibraryRender,
  type RenderOptions,
} from "@testing-library/react";
import type {ReactNode} from "react";
import {type Locale} from "@/i18n/config";
import {loadMessages} from "@/i18n/messages";

type Props = {
  children: ReactNode;
  locale?: Locale;
  messages?: AbstractIntlMessages;
};

type Options = Omit<RenderOptions, "wrapper"> & {
  locale?: Locale;
  messages?: AbstractIntlMessages;
};

function TestIntlProvider({children, locale = "en", messages}: Props) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages ?? loadMessages(locale)}
      timeZone="Asia/Jakarta"
    >
      {children}
    </NextIntlClientProvider>
  );
}

function render(ui: React.ReactElement, {locale, messages, ...options}: Options = {}) {
  return testingLibraryRender(ui, {
    ...options,
    wrapper: ({children}) => (
      <TestIntlProvider locale={locale} messages={messages}>
        {children}
      </TestIntlProvider>
    ),
  });
}

export {
  act,
  fireEvent,
  renderHook,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

export {render};
