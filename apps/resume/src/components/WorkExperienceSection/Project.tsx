import styled from '@emotion/styled';
import { NextUITheme, useTheme } from '@nextui-org/react';

import { IProject } from '../../../_content/Side-Projects';
import Li from '../Li';
import TitleTooltip from '../TitleTooltip';

function Project({ title, description, startDate, endDate, which, techStack }: IProject) {
  const { theme } = useTheme();

  return (
    <Div>
      <TitleTooltip {...title} />
      {startDate && (
        <small>
          {startDate} ~ {endDate}
        </small>
      )}
      {description && <span>{description}</span>}
      {which.length > 0 && (
        <ul>
          {which.map((each, index) => (
            <Li key={index} theme={theme} dangerouslySetInnerHTML={{ __html: each }}></Li>
          ))}
        </ul>
      )}

      {techStack && techStack.length > 0 && (
        <TechDiv>
          {techStack.map((tech, index) => (
            <TechSpan key={index} theme={theme}>
              {tech}
            </TechSpan>
          ))}
        </TechDiv>
      )}
    </Div>
  );
}

export default Project;

const Div = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1.25rem;
`;

const TechDiv = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const TechSpan = styled.span<{ theme: NextUITheme | undefined }>`
  padding: 0.125rem 0.5rem;
  background-color: ${({ theme }) => theme.colors.accents1.value};
  border-radius: 32px;
  font-size: 0.75rem;
  transition: background-color 0.4s, color 0.3s;
`;
