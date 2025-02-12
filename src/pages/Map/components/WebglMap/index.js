import React, { PureComponent } from 'react';
import MapboxGL from 'mapbox-gl';
import _isEqual from 'lodash.isequal';
import styled from 'styled-components';
import idx from 'idx';
import PropTypes from 'prop-types';
import { withRouter, matchPath } from 'react-router-dom';
import slugify from 'slugify';

import Store from '~/store';
import { isSmallScreen } from '~/styles/utils';
import * as AppActions from '~/AppState';
import * as MapActions from '~/pages/Map/MapState';
import ProjectMarkers from '~/pages/Map/components/ProjectMarkers';
import {
  colorizeHbiLines, animateView, setView, toggleLayer,
  filterLayersById, getCenterFromGeom, resetMap, intersectionLayers,
  parseUrlOptions, setPlanningLegendFilter
} from '~/pages/Map/map-utils';

let MB_STYLE_URL
if (config.debug) {
  MB_STYLE_URL = `${config.map.style}?fresh=true`;
} else {
  MB_STYLE_URL = config.map.style;
}

MapboxGL.accessToken = config.map.accessToken;

const StyledMap = styled.div`
  width: 100%;
  flex: 1;
`;

class Map extends PureComponent {
  static propTypes = {
    zoom: PropTypes.number,
    center: PropTypes.arrayOf(PropTypes.number),
    pitch: PropTypes.number,
    bearing: PropTypes.number,
    show3dBuildings: PropTypes.bool,
    animate: PropTypes.bool,
    setMapContext: PropTypes.func,
    activeLayer: PropTypes.string,
    activeSection: PropTypes.number,
    hasMoved: PropTypes.bool,
    calculatePopupPosition: PropTypes.bool,
    dim: PropTypes.bool
  }

  static defaultProps = {
    zoom: config.map.view.zoom,
    center: config.map.view.center,
    pitch: config.map.view.pitch,
    bearing: config.map.view.bearing,
    show3dBuildings: true,
    animate: false,
    activeLayer: null,
    activeSection: null,
    setMapContext: () => {},
    hasMoved: false,
    calculatePopupPosition: false,
    dim: false
  }

  state = {
    loading: true,
    popupLngLat: false,
    map: false
  }

  componentDidMount() {
    this.map = new MapboxGL.Map({
      container: this.root,
      style: MB_STYLE_URL
    });

    const nav = new MapboxGL.NavigationControl({ showCompass: false });
    this.map.addControl(nav, 'bottom-left');

    this.map.on('load', this.handleLoad);
    this.props.setMapContext(this.map);

    window.map = this.map;
  }

  componentDidUpdate(prevProps) {
    if (this.state.loading) {
      return false;
    }

    const viewChanged = prevProps.zoom !== this.props.zoom ||
      !_isEqual(prevProps.center, this.props.center) ||
      prevProps.pitch !== this.props.pitch ||
      prevProps.bearing !== this.props.bearing;

    if (viewChanged) {
      this.setView(this.getViewFromProps(), this.props.animate);
    }

    const layerChanged = prevProps.activeLayer !== this.props.activeLayer ||
      prevProps.activeSection !== this.props.activeSection ||
      prevProps.show3dBuildings !== this.props.show3dBuildings ||
      !_isEqual(prevProps.filterHbi, this.props.filterHbi);

    if (layerChanged) {
      this.updateLayers();
    }

    if (prevProps.activeLayer !== this.props.activeLayer) {
      this.registerClickHandler()
    }

    if (!this.props.activeSection && this.state.popupLngLat) {
      this.disablePopup();
    }

    if (this.props.match.url === '/my-hbi' && !_isEqual(prevProps.hbi_values, this.props.hbi_values)) {
      colorizeHbiLines(this.map, this.props.hbi_values, this.props.filterHbi);
    }

    if (prevProps.activeSection && !this.props.activeSection) {
      // back button triggered
      resetMap({ zoom: this.map.getZoom() });
    }

    if (this.props.activeLayer === 'planungen') {
      Store.dispatch(MapActions.loadPlanningData());
    }

    return this.map.resize();
  }

  getViewFromProps = () => (
    {
      zoom: this.props.zoom,
      center: this.props.center,
      bearing: this.props.bearing,
      pitch: this.props.pitch
    }
  )

  setView = (view, animate = false) => {
    if (animate) {
      animateView(this.map, view);
    } else {
      setView(this.map, view);
    }
  }

  handleLoad = () => {
    this.registerClickHandler();
    this.map.on('dragend', this.handleMoveEnd);
    this.map.on('move', this.handleMove);

    const urlMapOptions = parseUrlOptions();

    if (urlMapOptions) {
      this.setView(urlMapOptions, false);
    } else if (!this.props.activeSection) {
      this.map.fitBounds(config.map.bounds, { animate: false });
    } else {
      this.setView(this.getViewFromProps(), false);
    }

    this.updateLayers();
    this.setState({ loading: false, map: this.map });

    this.map.resize();
  }

  registerClickHandler = () => {
    const projectsTarget = config.map.layers.projects.overlayLine
    const hbiTarget = config.map.layers.hbi.overlayLine

    if(this.props.activeLayer === 'zustand') {
      this.map.off('click', projectsTarget, this.handleClick)
      this.map.on('click', hbiTarget, this.handleClick)
    } else {
      this.map.off('click', hbiTarget, this.handleClick)
      this.map.on('click', projectsTarget, this.handleClick)
    }
  }

  updateLayers = () => {
    const isZustand = this.props.activeLayer === 'zustand';
    const isPlanungen = this.props.activeLayer === 'planungen';

    const hbiLayers = config.map.layers.hbi
    const projectsLayers = config.map.layers.projects

    intersectionLayers
      .forEach(layerName => toggleLayer(this.map, hbiLayers[layerName], isZustand));

    if (isZustand) {
      colorizeHbiLines(this.map, this.props.hbi_values, this.props.filterHbi);
    }

    setPlanningLegendFilter(this.map, this.props.filterPlannings)

    // project layers
    toggleLayer(this.map, 'fmb-projects', false)
    toggleLayer(this.map, projectsLayers.center, isPlanungen);
    toggleLayer(this.map, projectsLayers.side0, isPlanungen);
    toggleLayer(this.map, projectsLayers.side1, isPlanungen);
    toggleLayer(this.map, projectsLayers.overlayLine, isPlanungen);

    // hbi layers
    toggleLayer(this.map, hbiLayers.center, isZustand);
    toggleLayer(this.map, hbiLayers.side0, isZustand);
    toggleLayer(this.map, hbiLayers.side1, isZustand);
    toggleLayer(this.map, hbiLayers.overlayLine, isZustand);
    toggleLayer(this.map, hbiLayers.intersections, isZustand);
    toggleLayer(this.map, hbiLayers.intersectionsSide0, isZustand);
    toggleLayer(this.map, hbiLayers.intersectionsSide1, isZustand);
    toggleLayer(this.map, hbiLayers.intersectionsOverlay, isZustand);

    // other layers
    toggleLayer(this.map, config.map.layers.buildings3d, this.props.show3dBuildings);
    toggleLayer(this.map, config.map.layers.dimmingLayer, this.props.dim);

    const subMap = isZustand ? 'hbi' : 'projects'
    filterLayersById(this.map, subMap, this.props.activeSection);
  }

  handleClick = (e) => {
    const properties = idx(e.features, _ => _[0].properties);
    const geometry = idx(e.features, _ => _[0].geometry);
    const center = getCenterFromGeom(geometry, [e.lngLat.lng, e.lngLat.lat]);

    if (properties) {
      const name = slugify(properties.name || properties.street_name || '').toLowerCase();
      const { id } = properties;
      // when user is in detail mode, we don't want to show the tooltip again,
      // but directly switch to another detail view
      if (this.props.activeSection && !this.props.displayPopup) {
        const detailRoute = `/${this.props.activeView}/${id}/${name}`;
        this.props.history.push(detailRoute);
      } else {
        Store.dispatch(MapActions.setPopupData(properties));
        Store.dispatch(MapActions.setPopupVisible(true));
      }

      Store.dispatch(AppActions.setActiveSection(id));
      Store.dispatch(MapActions.setView({
        center,
        animate: true,
        zoom: isSmallScreen() ? config.map.zoomAfterGeocode : this.map.getZoom()
      }));

      this.handleMove();
    }

    this.updatePopupPos(center);
  }

  handleIntersectionClick = (evt) => {
    Store.dispatch(MapActions.setPopupData({ isIntersection: true }));
    Store.dispatch(MapActions.setPopupVisible(true));
    Store.dispatch(AppActions.setActiveSection(1));
    Store.dispatch(MapActions.setView({
      center: evt.lngLat,
      animate: true,
      zoom: isSmallScreen() ? config.map.zoomAfterGeocode : this.map.getZoom()
    }));

    this.handleMove();
    this.updatePopupPos(evt.lngLat);
  }

  handleMarkerClick = (evt, data) => {
    evt.preventDefault();
    evt.stopPropagation();

    const { id, street_name: name } = data;
    const center = data.center.coordinates;

    const match = matchPath(this.props.location.pathname, {
      path: '/(zustand|planungen)/:id/:name?',
      exact: true
    });

    // const properties = {
    //   title: data.title,
    //   name: name || '-'
    // };

    const isDetailViewOpen = idx(match, _ => _.params.id) != null
    if (isDetailViewOpen) {
      const slugifiedName = slugify(name || '').toLowerCase();
      const detailRoute = `/${this.props.activeView}/${id}/${slugifiedName}`;
      this.props.history.push(detailRoute);
    } else {
      Store.dispatch(MapActions.setPopupData(data));
      Store.dispatch(MapActions.setPopupVisible(true));
      Store.dispatch(AppActions.setActiveSection(id));
      Store.dispatch(MapActions.setView({
        center,
        animate: true,
        zoom: isSmallScreen() ? config.map.zoomAfterGeocode : this.map.getZoom()
      }));

      this.handleMove();
      this.updatePopupPos(center);
    }
  }

  handleMoveEnd = () => {
    if (!this.props.hasMoved) {
      Store.dispatch(MapActions.setHasMoved(true));
    }
  }

  handleMove = () => {
    if (this.state.popupLngLat && this.props.calculatePopupPosition) {
      const center = this.map.project(this.state.popupLngLat);
      Store.dispatch(MapActions.setPopupLocation(center));
    }
  }

  updatePopupPos(center) {
    if (center && this.props.calculatePopupPosition) {
      this.setState({ popupLngLat: center });
      const projCenter = this.map.project(center);
      Store.dispatch(MapActions.setPopupLocation(projCenter));
    }
  }

  disablePopup() {
    this.setState({ popupLngLat: null });
  }

  render() {
    const markerData = idx(this.props.planningData, _ => _.results);

    return (
      <StyledMap className={this.props.className} ref={(ref) => { this.root = ref; }}>
        {this.props.children}
        <ProjectMarkers
          map={this.state.map}
          data={markerData}
          active={this.props.activeLayer === 'planungen'}
          onClick={this.handleMarkerClick}
          filterPlannings={this.props.filterPlannings}
        />
      </StyledMap>
    );
  }
}

export default withRouter(Map);
