import React from 'react';
import styled from 'styled-components';

import { media } from '~/styles/utils';
import Button from '~/pages/KatasterKI/components/Button';
import QuestionTitle from '~/pages/KatasterKI/components/QuestionTitle';
import ShareButton from '~/pages/KatasterKI/components/ShareButton';

const SingleChoiceWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  button {
    margin-bottom: 28px;
  }

  ${media.m`
    button {
      margin-left: auto;
      margin-right: auto;
      margin-bottom: 32px;
    }
  `};
`;

const Helper = styled.p`
  display: flex;
  flex-direction: column;

  margin: 0 auto;
  line-height: 1.4em;
`;

const PerspectiveChange = ({ title, options, helper, handleChange, next }) => {
  const onClick = (option) => {
    handleChange({ nextPerspective: option.value });
    next();
  };

  return (
    <SingleChoiceWrapper>
      <QuestionTitle>{title}</QuestionTitle>
      {options.map((option) => {
        const ButtonIcon = option.icon;
        return (
          <Button
            key={`singlechoice__${option.value}`}
            onClick={() => onClick(option)}
            css={{
              textAlign: 'left',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              padding: '0 10px',
              height: 48
            }}
          >
            <ButtonIcon /> {option.label}
          </Button>
        );
      })}

      <Helper>{helper}</Helper>
    </SingleChoiceWrapper>
  );
};

export default PerspectiveChange;
