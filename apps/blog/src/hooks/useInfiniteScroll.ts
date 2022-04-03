import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useIntersectionObserver, { Props as IntersectionOberserProps } from './useIntersectionObserver';

interface Props<T> extends Omit<IntersectionOberserProps, 'onIntersect'> {
  fullElements: T[];
  sessionKey: string;
  offset: number;
}

function saveIntersectionCount(key: string, count: number) {
  sessionStorage.setItem(key, JSON.stringify(count));
}

function getIntersectionCount(key: string) {
  if (typeof sessionStorage === 'undefined') return 1;
  const sessionValue = sessionStorage.getItem(key);
  if (sessionValue) return parseInt(sessionValue);

  saveIntersectionCount(key, 1);
  return 1;
}

function useInfiniteScroll<T>({ fullElements, sessionKey, offset }: Props<T>) {
  const [elements, setElements] = useState<T[]>(fullElements.slice(0, offset));
  const [intersectionCount, setIntersectionCount] = useState<number>(getIntersectionCount(sessionKey));
  const [isEnded, setIsEnded] = useState<boolean>(fullElements.length < offset);

  const { setTarget } = useIntersectionObserver({
    onIntersect: ([{ isIntersecting }]) => {
      if (isIntersecting) {
        setIntersectionCount(prev => prev + 1);
      }
    },
  });

  useEffect(() => {
    setElements(fullElements.slice(0, offset * intersectionCount));
    setIsEnded(offset * intersectionCount > fullElements.length);
  }, [fullElements, intersectionCount, offset]);

  const router = useRouter();
  useEffect(() => {
    function onRouteChangeStart() {
      saveIntersectionCount(sessionKey, intersectionCount);
    }

    router.events.on('routeChangeStart', onRouteChangeStart);

    return () => router.events.off('routeChangeStart', onRouteChangeStart);
  }, [intersectionCount, router, sessionKey]);

  return { elements, setTarget, isEnded };
}

export default useInfiniteScroll;
