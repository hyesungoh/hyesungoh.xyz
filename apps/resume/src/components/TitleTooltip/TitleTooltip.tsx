import styled from '@emotion/styled';
import { Button, Tooltip, useTheme } from '@nextui-org/react';
import { Icon } from 'core';

import useIsPrint from '../../hooks/useIsPrint';

interface Props {
  text: string;
  githubLink: string | null;
  otherLink: string | null;
}

function TitleTooltip({ text, githubLink, otherLink }: Props) {
  const isPrint = useIsPrint();

  if (githubLink === null && otherLink === null) {
    return <h3>{text}</h3>;
  }

  if (isPrint) {
    return (
      <h3>
        <a href={githubLink || otherLink} target="_blank" rel="noreferrer">
          {text}
        </a>
      </h3>
    );
  }

  return (
    <Tooltip
      placement="topStart"
      color="primary"
      content={<TooltipContent githubLink={githubLink} otherLink={otherLink} />}
    >
      <StyledButton auto light color="primary" animated={false}>
        <h3>{text}</h3>
      </StyledButton>
    </Tooltip>
  );
}

export default TitleTooltip;

const StyledButton = styled(Button)`
  padding-left: 0;
  padding-right: 2px;
`;

interface TooltipProps {
  githubLink: string | null;
  otherLink: string | null;
}

function TooltipContent({ githubLink, otherLink }: TooltipProps) {
  const { theme } = useTheme();

  return (
    <Div>
      {githubLink && (
        <a href={githubLink} rel="noreferrer" target="_blank">
          <Button auto light icon={<Icon name="GithubLine" fill={theme.colors.white.value} />} />
        </a>
      )}
      {otherLink && (
        <a href={otherLink} rel="noreferrer" target="_blank">
          <Button auto light icon={<Icon name="Link" fill={theme.colors.white.value} />} />
        </a>
      )}
    </Div>
  );
}

const Div = styled.div`
  display: flex;
  gap: 2px;
  padding: 0 2px;
`;
