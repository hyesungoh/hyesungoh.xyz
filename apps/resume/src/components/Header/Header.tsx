import styled from '@emotion/styled';
import { Avatar, Text, useTheme } from '@nextui-org/react';
import { ThemeSwitch } from 'core';
import { authorImage, authorName } from 'core/constants';

import { IHeader } from '../../../_content/Header';
import useIsPrint from '../../hooks/useIsPrint';

interface Props extends IHeader {}

function Header({ heading, description }: Props) {
  const { theme } = useTheme();

  const isPrint = useIsPrint();

  return (
    <header>
      <HeadingWrapper>
        {isPrint ? (
          <H1 h1>{heading}</H1>
        ) : (
          <H1
            h1
            css={{
              textGradient: `45deg, ${theme.colors.text.value} 10%, ${theme.colors.primary.value} 60%`,
            }}
          >
            {heading}
          </H1>
        )}

        {!isPrint && <ThemeSwitch />}
      </HeadingWrapper>

      <DescriptionWrapper>
        <Avatar src={authorImage.default.src} alt={authorName} text={authorName} size="xl" />
        <Div>
          <p dangerouslySetInnerHTML={{ __html: description }} />
          {isPrint && (
            <small style={{ textDecoration: 'underline' }}>
              해당 이력서는 <a href="https://resume.hyesungoh.xyz/">https://resume.hyesungoh.xyz</a>에서 보다 원활하게
              확인하실 수 있습니다.
            </small>
          )}
        </Div>
      </DescriptionWrapper>
    </header>
  );
}

export default Header;

const HeadingWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.125rem;

  & > label:last-of-type {
    margin-top: 8px;
  }
`;

const H1 = styled(Text)`
  font-size: 3rem;
  line-height: 3rem;
  margin-bottom: 8px;
`;

const DescriptionWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Div = styled.div`
  margin-left: 0.875rem;
`;
