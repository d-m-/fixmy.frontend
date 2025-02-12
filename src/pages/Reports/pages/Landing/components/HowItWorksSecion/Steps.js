import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px;
`;

const Item = styled.div`
  display: flex;
  align-items: baseline;
  padding-bottom: 2em;
  border-left: 2px solid ${config.colors.lightgrey};

  &:last-child {
    border-left: 2px solid white;
  }
`;

const Text = styled.p`
  margin: 0;
  font-size: 16px;
  color: ${config.colors.darkgrey};
  float: right;
  flex-grow: 1;
`;

const StepIndicator = styled.span`
  flex-shrink: 0;
  margin-right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid white;
  color: white;
  background-color: ${props => props.color};
  position: relative;
  right: 13px;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1;
`;

const StepNumber = styled.span`
  display: block;
  font-size: 12px;
  color: white;
  font-weight: bold;
`;

export default ({ steps }) => (
  <Wrapper>
    {steps.map(({ step, text, color }) => (
      <Item key={`step__${step}`}>
        <StepIndicator color={color}>
          <StepNumber>{step}</StepNumber>
        </StepIndicator>
        <Text>{text}</Text>
      </Item>
    ))}
  </Wrapper>
);
