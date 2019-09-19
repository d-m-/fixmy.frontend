import React from 'react';
import styled from 'styled-components';

import Title from '~/components/Title';

const StyledTitle = styled(Title)`
  margin: 16px 0 24px 0;
`;

export default ({ data }) => {
  if (!data) {
    return null;
  }

  const { title } = data;

  const PlanningStatusLabel = title || 'Keine Planungen vorhanden.';

  return (
    <StyledTitle>{PlanningStatusLabel}</StyledTitle>
  );
};
