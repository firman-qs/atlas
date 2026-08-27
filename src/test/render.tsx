import {NextIntlClientProvider, type AbstractIntlMessages} from "next-intl";
import {
  render as testingLibraryRender,
  type RenderOptions,
} from "@testing-library/react";
import type {ComponentType, ReactNode} from "react";
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
  wrapper?: ComponentType<{children: ReactNode}>;
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

function render(
  ui: React.ReactElement,
  {locale, messages, wrapper: Wrapper, ...options}: Options = {},
) {
  return testingLibraryRender(ui, {
    ...options,
    wrapper: ({children}) => (
      <TestIntlProvider locale={locale} messages={messages}>
        {Wrapper ? <Wrapper>{children}</Wrapper> : children}
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
