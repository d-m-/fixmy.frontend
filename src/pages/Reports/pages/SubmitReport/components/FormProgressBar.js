import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import BikeParkIcon from '~/images/reports/bikeparkdark.svg';
import TickIcon from '~/images/reports/tick-icon.svg';
import history from '~/history';

const BackLink = styled.a`
  position: absolute;
  top: 10px;
  left: 8px;
  cursor: pointer;
  font-size: 10px;
  font-weight: bold;
  color: ${config.colors.darkgrey};

  &.hidden:after {
    content: ''
  }
`;

const NavBar = styled.div`
  height: 54px;
  box-sizing: unset;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 31px 4px 4px 8px;
  border-bottom: solid 1px ${config.colors.inactivegrey};
`;

const StyledBikeParkIcon = styled(BikeParkIcon)`
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
  padding-bottom: 8px; // quick fix. svg icon is smaller than viewBox, TODO: ask for fixed icon
  order: 1;
`;

const StepCaption = styled.h4`
  font-size: 10px;
  font-weight: bold;
  color: #999999;
  order: 2;
  flex-grow: 2;
`;

const StepIndicator = styled.span`
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${config.colors.inactivegrey};
  line-height: 24px;
  text-align: center;
  color: white;
  font-size: 13px;
  font-weight: bold;
  // put at the end
  order: 10;
  margin-right: 12px;

  &.active {
    margin-right: unset;
    order: 0;
    background-color: ${config.colors.interaction};
  }
`;

const DoneStep = styled(StepIndicator)`
 order: -1;
`;

const StyledTickIcon = styled(TickIcon)`
  order: 3;
  position: absolute;
  top: 34px;
  left: 166px;
`;

const FormProgressBar = ({ stepNumber, stepCaption, onBackButtonTap }) => {
  const isLastStep = stepNumber === 4;

  return (
    <NavBar>
      {!isLastStep && (
        <BackLink onClick={onBackButtonTap} className={isLastStep ? 'hidden' : ''}>&lt; zurück</BackLink>
      )}
      <StepCaption>{stepCaption}</StepCaption>
      <StyledBikeParkIcon />

      {stepNumber > 1 ? <DoneStep>&#10004;</DoneStep> : <StepIndicator className={stepNumber === 1 ? 'active' : ''}>1</StepIndicator>}
      {stepNumber > 2 ? <DoneStep>&#10004;</DoneStep> : <StepIndicator className={stepNumber === 2 ? 'active' : ''}>2</StepIndicator>}
      {stepNumber > 3 ? <DoneStep>&#10004;</DoneStep> : <StepIndicator className={stepNumber === 3 ? 'active' : ''}>3</StepIndicator>}

      {isLastStep && <StyledTickIcon />}

    </NavBar>
  );
};

FormProgressBar.propTypes = {
  stepNumber: PropTypes.number,
  stepCaption: PropTypes.string,
  onBackButtonTap: PropTypes.func
};

FormProgressBar.defaultProps = {
  stepNumber: 1,
  stepCaption: 'Ort',
  onBackButtonTap: history.goBack
};

export default FormProgressBar;