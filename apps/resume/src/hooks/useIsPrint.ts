import { useRouter } from 'next/router';

export default function useIsPrint() {
  const router = useRouter();

  return router.pathname === '/print';
}
