import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import idx from 'idx';
import styled from 'styled-components';
import { withRouter } from 'react-router';
import Axios from 'axios';

const DetailWrapper = styled.div`
  position: absolute;
  left: 0;
  top:0;
  width: 100%;
  height: 100%;
  z-index: 3000;
  background: white;
`;

const DetailHeader = styled.div`
  display: flex;
  background: ${config.colors.lightbg};
  padding: 10px;
  color: ${config.colors.darkgrey};
  font-size: 12px;
  line-height: 1.5;
`;

const DetailTitle = styled.div`
  text-transform: uppercase;
  font-weight: 600;
`;

const DetailSubtitle = styled.div`
  text-transform: uppercase;
`;

const DetailBody = styled.div``;

const Close = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: 24px;
  color: ${config.colors.midgrey};
  margin-left: auto;
  cursor: pointer;
`;

function detailWrapped(Component) {
  class DetailWrapperComp extends PureComponent {
    static propTypes = {
      apiEndpoint: PropTypes.string.isRequired,
      onCloseRoute: PropTypes.string
    }

    static defaultProps = {
      onCloseRoute: '/'
    }

    state = {
      data: null,
      isLoading: true,
      isError: false
    }

    componentDidMount() {
      const id = idx(this.props.match, _ => _.params.id);

      Axios
        .get(`${config.apiUrl}/${this.props.apiEndpoint}/${id}`)
        .then(this.onDataLoaded)
        .catch(this.onDataError);
    }

    onDataLoaded = (res) => {
      this.setState({
        data: res.data,
        isLoading: false,
        isError: false
      });
    }

    onDataError = () => {
      this.setState({
        isLoading: false,
        isError: true
      });
    }

    onClose = () => {
      this.props.history.push(this.props.onCloseRoute);
    }

    render() {
      const { isLoading, isError, data } = this.state;
      if (isLoading) {
        return <div>Daten werden geladen ...</div>;
      }

      if (isError) {
        return <div>Ein Fehler ist aufgetreten</div>;
      }

      return (
        <DetailWrapper>
          <DetailHeader>
            <div>
              <DetailTitle>{data.name}</DetailTitle>
              <DetailSubtitle>Abschnitt 1</DetailSubtitle>
            </div>
            <Close onClick={this.onClose}>×</Close>
          </DetailHeader>
          <DetailBody>
            <Component
              data={data}
              {...this.props}
            />
          </DetailBody>
        </DetailWrapper>
      );
    }
  }

  return withRouter(DetailWrapperComp);
}

export default detailWrapped;
