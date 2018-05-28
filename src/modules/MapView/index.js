import React, { PureComponent } from 'react';
import { Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import styled from 'styled-components';

import SearchBar from '~/components/SearchBar';
import LocatorControl from '~/components/LocatorControl';

import Store from '~/redux/store';

import 'mapbox-gl/dist/mapbox-gl.css';

import Map from './Map';
import * as MapActions from './MapState';

const MapView = styled.div`
  height: 100%;
  width: 100%;

  .mapboxgl-ctrl-bottom-left, .mapboxgl-ctrl-bottom-right {
    position: fixed;
    z-index: 99999999;
  }
`;

class MapViewComponent extends PureComponent {
  state = {
    userLocation: null
  }

  componentDidMount() {
    const view = config.map.views[this.props.location.pathname];
    if (view) {
      Store.dispatch(MapActions.setView(Object.assign(view, { animate: false })));
    }
  }

  componentDidUpdate(prevProps) {
    const prevPath = prevProps.location.pathname;
    const thisPath = this.props.location.pathname;
    const nextView = config.map.views[thisPath];

    console.log(nextView);

    if (prevPath !== thisPath && nextView) {
      Store.dispatch(MapActions.setView(nextView));
    }
  }

  updateView = (view) => {
    Store.dispatch(MapActions.setView(view));
  }

  handleLocationChange = (userLocation) => {
    this.updateView({ center: userLocation });
  }

  render() {
    return (
      <MapView>
        <Route
          path="(/zustand|/planungen)"
          component={SearchBar}
        />
        <Route
          path="(/zustand|/planungen)"
          render={() => (
            <LocatorControl
              onChange={this.handleLocationChange}
              position="top-right"
            />
          )}
        />
        <Route
          path="(/|/zustand|/planungen)"
          render={() => (
            <Map
              key="MapComponent"
              accessToken={config.map.accessToken}
              zoom={this.props.zoom}
              center={this.props.center}
              bearing={this.props.bearing}
              pitch={this.props.pitch}
              show3dBuildings={this.props.show3dBuildings}
              animate={this.props.animate}
              updateView={this.updateView}
            />
          )}
        />
      </MapView>
    );
  }
}

export default withRouter(connect(state => state.MapState)(MapViewComponent));
