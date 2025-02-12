import React, { PureComponent } from 'react';
import styled from 'styled-components';
import idx from 'idx';
import { connect } from 'react-redux';

import { sortByKey } from '~/utils/utils';
import { districts } from '~/labels';
import {
  loadProjectData, setDistrictFilter, setPhaseFilter, setSort
} from '~/pages/Analysis/AnalysisState';
import PieChart from '~/pages/Analysis/components/PieChart';
import BigLabel from '~/components/BigLabel';
import MenuButton from '~/components/MenuButton';
import Flex from '~/components/Flex';
import Select from '~/components/Select';
import ProjectList from '~/components/ProjectList';
import Card from './components/Card';

const AnalysisWrapper = styled.div`
  background: ${config.colors.lightgrey};
  padding: 8px;
  height: 100%;
  overflow-y: scroll;
`;

const StyledSelect = styled(Select)`
  max-width: 50%;
`;

const AnalysisContent = styled.div`
  max-width: 650px;
  margin: 0 auto;
`;

const AnalysisHeader = styled.div`
  text-align: center;
  position: relative;
  padding: 16px 0;
`;

const AnalysisControls = styled.div`
  margin: 16px 0;
  display: ${props => (props.isVisible ? 'flex' : 'none')};
  justify-content: space-between;
`;

const StyledMenuButton = styled(MenuButton)`
  top: auto;
`;

const districtOptions = [
  { label: 'Alle Bezirke anzeigen', value: 'all' },
  ...districts.map(districtName => ({ label: districtName, value: districtName.toLowerCase() }))
];

const phaseOptions = [
  { label: 'Alle Phasen anzeigen', value: 'all' },
  ...config.planningPhases.map(phase => ({ label: phase.name, value: phase.id }))
];

const sortOptions = [
  { value: 'likes', label: 'Likes', sortDirection: 'DESC' },
  { value: 'length', label: 'Länge', sortDirection: 'DESC' },
  { value: 'construction_completed', label: 'Fertigstellung', sortDirection: 'ASC' }
];

function filterDistrict(districtName) {
  return d => (!districtName ? true : d.borough.toLowerCase() === districtName.toLowerCase());
}

function filterPhase(phaseName) {
  return d => (!phaseName ? true : d.phase === phaseName.toLowerCase());
}

class Analysis extends PureComponent {
  componentDidMount() {
    const selectedDistrict = idx(this.props, _ => _.match.params.districtName);
    this.props.loadProjectData(selectedDistrict);
  }

  onDistrictChange = (evt) => {
    const districtName = idx(evt, _ => _.target.selectedOptions[0].value);
    const showAll = districtName === 'all';
    const selectedDistrict = showAll ? false : districtName;
    const nextRoute = selectedDistrict ? `/${selectedDistrict}` : '';

    this.props.history.push(`/analyse/planungen${nextRoute}`);
    this.props.setDistrictFilter(selectedDistrict);
  }

  onPhaseFilterChange = (evt) => {
    const phaseValue = idx(evt, _ => _.target.selectedOptions[0].value);
    const showAll = phaseValue === 'all';
    const selectedPhase = showAll ? false : phaseValue;
    this.props.setPhaseFilter(selectedPhase);
  }

  onSort = (evt) => {
    const sortValue = idx(evt, _ => _.target.selectedOptions[0].value);
    this.props.setSort(sortValue);
  }

  render() {
    const {
      data, isLoading, selectedDistrict, selectedPhase, selectedSort
    } = this.props;

    // for the pie chart we only filter by district
    const filteredDataDistrict = data.filter(filterDistrict(selectedDistrict));
    // for the list we filter by district AND phase
    const filteredData = filteredDataDistrict.filter(filterPhase(selectedPhase));
    const hasData = filteredData.length > 0;
    const { sortDirection } = selectedSort ? sortOptions.find(s => s.value === selectedSort) : 'ASC';
    const sortedData = filteredData.sort(sortByKey(selectedSort, sortDirection));

    return (
      <AnalysisWrapper>
        <AnalysisContent>
          <AnalysisHeader>
            <StyledMenuButton />
            <BigLabel>Analyse</BigLabel>
          </AnalysisHeader>
          <Card>
            <Flex justifyContent="space-between">
              <StyledSelect
                title="Wähle einen Bezirk:"
                options={districtOptions}
                onChange={this.onDistrictChange}
                disabled={isLoading}
                value={selectedDistrict || 'all'}
                isVisible={!isLoading}
              />
              <StyledSelect
                title="Phase filtern:"
                options={phaseOptions}
                onChange={this.onPhaseFilterChange}
                disabled={isLoading}
                value={selectedPhase || 'all'}
              />
            </Flex>
            <PieChart data={filteredData} isLoading={isLoading} />
          </Card>

          <AnalysisControls isVisible={!isLoading && hasData}>
            <Select
              title="Sortieren:"
              options={sortOptions}
              onChange={this.onSort}
              disabled={isLoading}
              value={selectedSort || 'likes'}
            />
          </AnalysisControls>

          <ProjectList
            data={sortedData}
            isLoading={isLoading}
            showLoadingIndicator={false}
          />
        </AnalysisContent>
      </AnalysisWrapper>
    );
  }
}

export default connect(
  state => state.AnalysisState,
  dispatch => ({
    loadProjectData: districtName => dispatch(loadProjectData(districtName)),
    setDistrictFilter: districtName => dispatch(setDistrictFilter(districtName)),
    setPhaseFilter: districtName => dispatch(setPhaseFilter(districtName)),
    setSort: sort => dispatch(setSort(sort))
  })
)(Analysis);
