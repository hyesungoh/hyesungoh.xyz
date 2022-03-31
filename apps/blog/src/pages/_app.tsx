import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { KBarProvider, useRegisterActions } from 'kbar';
import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

import { lightTheme, darkTheme } from 'core';
import generateKbarAction from '../constants/KbarActions';

const KbarComponent = dynamic(() => import('core/components/Kbar'), {
  ssr: false,
});

export default function BlogApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const kbarActions = generateKbarAction(router);

  return (
    <NextThemesProvider
      defaultTheme="system"
      attribute="class"
      value={{ light: lightTheme.className, dark: darkTheme.className }}
    >
      <NextUIProvider>
        <KBarProvider actions={kbarActions}>
          <HandleActionWithRoute />
          <KbarComponent />
          <Component {...pageProps} />
        </KBarProvider>
      </NextUIProvider>
    </NextThemesProvider>
  );
}

function HandleActionWithRoute() {
  const router = useRouter();

  const homeAction = {
    id: 'home',
    name: 'Home',
    section: 'Scope',
    perform: () => {
      router.push('/');
    },
  };

  useRegisterActions(router.pathname !== '/' ? [homeAction] : [], [router.pathname]);
  return <></>;
}
