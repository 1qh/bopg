'use client'

import type { ReactNode } from 'react'

import { IntlErrorCode, NextIntlClientProvider, useLocale } from 'next-intl'

const IntlErrorHandling = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider
    locale={useLocale()}
    onError={e => {
      if (e.code === IntlErrorCode.MISSING_MESSAGE) {
        //
      }
    }}>
    {children}
  </NextIntlClientProvider>
)

export default IntlErrorHandling
