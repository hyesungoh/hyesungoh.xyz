import { useTheme } from '@nextui-org/react';
import PostType from '../types/post';
import { getAllPosts } from '../lib/api';
import SEO from '../components/SEO';
import MainHeader from '../components/Header/MainHeader';
import PostCard from '../components/PostCard';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import AuthorSection from '../components/AuthorSection';
import useScrollRestoration from '../hooks/useScrollRestoration';

interface Props {
  allPosts: PostType[];
}

function Blog({ allPosts }: Props) {
  const { theme } = useTheme();
  useScrollRestoration();

  const {
    setTarget,
    elements: posts,
    isEnded,
  } = useInfiniteScroll<PostType>({ fullElements: allPosts, sessionKey: 'home', offset: 20, rootMargin: '100px' });

  return (
    <>
      <SEO />
      <MainHeader />
      <AuthorSection />

      <main>
        {posts.map(({ slug, title, date, category, subtitle }) => (
          <PostCard
            key={slug}
            slug={slug}
            title={title}
            subtitle={subtitle}
            date={date}
            category={category}
            theme={theme}
          />
        ))}

        {!isEnded && <div ref={setTarget}></div>}
      </main>
    </>
  );
}

export default Blog;

export async function getStaticProps() {
  const allPosts = getAllPosts(['title', 'subtitle', 'date', 'category', 'slug']);

  return {
    props: {
      allPosts,
    },
  };
}