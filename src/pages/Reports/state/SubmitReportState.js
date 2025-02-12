/* eslint-disable  no-multi-spaces */
import booleanWithin from '@turf/boolean-within';
import idx from 'idx';

import reverseGeocode from '~/services/reverseGeocode';
import { getGeoLocation } from '~/pages/Map/map-utils'; // TODO: handle eslint warning regarding dependency circle
import { apiSubmitReport, marshallNewReportObjectFurSubmit } from '~/pages/Reports/apiservice';
import { actions as errorStateActions } from './ErrorState';


// action constants

const types = {};

const PREFIX = 'Reports/SubmitReportState/';
types.RESET_DIALOG_STATE = `${PREFIX}RESET_DIALOG_STATE`;
types.SET_LOCATION_MODE = `${PREFIX}SET_LOCATION_MODE`;
types.SET_LOCATION_MODE_GEOCODING = `${PREFIX}SET_LOCATION_MODE_GEOCODING`;
types.SET_LOCATION_MODE_DEVICE = `${PREFIX}SET_LOCATION_MODE_DEVICE`;
types.SET_DEVICE_LOCATION = `${PREFIX}SET_DEVICE_LOCATION`;
types.GEOCODE_COMPLETE = `${PREFIX}GEOCODE_COMPLETE`;
types.VALIDATE_POSITION = `${PREFIX}VALIDATE_POSITION`;
types.INVALIDATE_POSITION = `${PREFIX}INVALIDATE_POSITION`;
types.REVERSE_GEOCODE_COMPLETE = `${PREFIX}REVERSE_GEOCODE_COMPLETE`;
types.SET_TEMP_LOCATION_COORDS = `${PREFIX}SET_TEMP_LOCATION_COORDS`;
types.SET_TEMP_LOCATION_ADDRESS = `${PREFIX}SET_TEMP_LOCATION_ADDRESS`;
types.CONFIRM_LOCATION = `${PREFIX}CONFIRM_LOCATION`;
types.SET_BIKESTAND_COUNT = `${PREFIX}SET_BIKESTAND_COUNT`;
types.SET_ADDITIONAL_DATA = `${PREFIX}SET_ADDITIONAL_DATA`;
types.SET_FEE_ACCEPTABLE = `${PREFIX}SET_FEE_ACCEPTABLE`;
types.SUBMIT_REPORT_PENDING = `${PREFIX}SUBMIT_REPORT_PENDING`;
types.SUBMIT_REPORT_COMPLETE = `${PREFIX}SUBMIT_REPORT_COMPLETE`;
types.SUBMIT_REPORT_ERROR = `${PREFIX}SUBMIT_REPORT_ERROR`;

// other constants

export const LOCATION_MODE_DEVICE = 'DEVICE'; // not an action type, keeping this here to prevent typos
export const LOCATION_MODE_GEOCODING = 'GEOCODING';

// action creators

const actions = {};

actions.resetDialogState = () => ({
  type: types.RESET_DIALOG_STATE
});

actions.setLocationMode = mode => ({
  type: types.SET_LOCATION_MODE,
  mode
});

actions.setLocationModeGeocoding = () => ({
  type: types.SET_LOCATION_MODE,
  mode: LOCATION_MODE_GEOCODING
});

actions.setLocationModeDevice = () => ({
  type: types.SET_LOCATION_MODE,
  mode: LOCATION_MODE_DEVICE
});

actions.setTempLocationCoords = ({ lng, lat }) => ({
  type: types.SET_TEMP_LOCATION_COORDS,
  payload: { lng, lat }
});

actions.setTempLocationAddress = address => ({
  type: types.SET_TEMP_LOCATION_ADDRESS,
  address
});

actions.confirmLocation = () => ({
  type: types.CONFIRM_LOCATION
});

actions.setDeviceLocation = ({ lng, lat }) => ({
  type: types.SET_DEVICE_LOCATION,
  payload: { lng, lat }
});

actions.handleGeocodeSuccess = ({ coords, address }) => ({
  type: types.GEOCODE_COMPLETE,
  payload: { coords, address }
});

actions.setBikestandCount = amount => ({
  type: types.SET_BIKESTAND_COUNT,
  payload: amount
});

actions.setAdditionalData = ({ photo, description }) => ({
  type: types.SET_ADDITIONAL_DATA,
  payload: { photo, description }
});

actions.setFeeAcceptable = isFeeAcceptable => ({
  type: types.SET_FEE_ACCEPTABLE,
  isFeeAcceptable
});

// thunks

actions.validateCoordinates = (polygonGeoJson, { lng, lat }) => async (dispatch) => {
  const pointFeature = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [lng, lat]
    }
  };

  if (booleanWithin(pointFeature, polygonGeoJson)) {
    dispatch({
      type: types.VALIDATE_POSITION
    });
    return true;
  }
  dispatch({
    type: types.INVALIDATE_POSITION
  });
  return false;
};

actions.reverseGeocodeCoordinates = ({ lat, lng }) => async (dispatch) => {
  let result;
  let errorMsg;
  try {
    result = await reverseGeocode({ lat, lng });
  } catch (e) {
    errorMsg = 'Fehler beim Auflösen der Koordinaten in eine Adresse';
  }
  if (!result) {
    errorMsg = 'Die Geokoordinaten konnten in keine Adresse aufgelöst werden';
  }

  if (errorMsg) {
    return dispatch(errorStateActions.addError({
      message: errorMsg
    }));
  }

  dispatch({ type: types.REVERSE_GEOCODE_COMPLETE, payload: { result } });
  dispatch({ type: types.SET_TEMP_LOCATION_ADDRESS, address: result });
};


actions.useDevicePosition = () => async (dispatch) => {
  let coords;
  try {
    const position = await getGeoLocation();
    if (!position.coords) throw new Error('Getting device geolocation failed');
    // eslint-disable-next-line prefer-destructuring
    coords = position.coords;
    dispatch(
      actions.setDeviceLocation({ lng: coords.longitude, lat: coords.latitude })
    );
    dispatch(actions.setLocationModeDevice());
  } catch (err) {
    const errMsg = 'Standortbestimmung fehlgeschlagen. ' +
      'Gib die Adresse bitte ein oder verschiebe die Karte zu Deinem Standort.';
    dispatch(
      errorStateActions.addError({
        message: errMsg
      })
    );
  }
};

actions.submitReport = () => async (dispatch, getState) => {
  dispatch({ type: types.SUBMIT_REPORT_PENDING });

  try {
    const reportPayload = marshallNewReportObjectFurSubmit(getState().ReportsState.SubmitReportState.newReport);
    const submittedReport = await apiSubmitReport(reportPayload);
    dispatch({ type: types.SUBMIT_REPORT_COMPLETE, submittedReport });
  } catch (e) {
    const errMsg = 'Beim Übermitteln der Meldung ist etwas schiefgelaufen.';
    dispatch({ type: types.SUBMIT_REPORT_ERROR }); // update UI
    dispatch(
      errorStateActions.addError({ // show ErrorMessage using the generic component
        message: errMsg
      })
    );
  }
};

// reducer

const initialState = {
  locationMode: null,           // either LOCATION_MODE_DEVICE or LOCATION_MODE_GEOCODING
  deviceLocation: null,         // { lng, lat}
  geocodeResult: null,          // { coords, address}
  reverseGeocodeResult: null,
  tempLocation: {               // fostered when the user searches a suitable location for a report. when confirmed, props get attached to the newReport item
    lngLat: null,               // { lng, lat}
    address: '',                // reverse-geocoding result
    pinned: false,              // true when the user has confirmed the location he set using the map
    valid: true                 // set to false when a location is outside the area of interest
  },
  apiRequestStatus: {
    submitting: false,          // set true during submission of the report item to the api
    submitted: false            // set true on submit success
  },
  newReport: {                 // instance of json schema agreed upon
    address: null,              // address string
    geometry: {},               // GeoJson point feature
    details: {
      subject: 'BIKE_STANDS',
      number: null,             // number of bikestands
      fee_acceptable: null      // if the user would pay for managed parking
    },
    photo: null,                // jpeg in base64
    description: null          // textual description of the problem / potential site
  }
};

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case types.RESET_DIALOG_STATE:
      //  keep locationMode in order to display the map after user clicked "Ort ändern"
      return { ...initialState, locationMode: state.locationMode };
    case types.SET_DEVICE_LOCATION:
      return { ...state, deviceLocation: action.payload };
    case types.GEOCODE_COMPLETE:
      return {
        ...state,
        geocodeResult: action.payload.coords,
        tempLocation: {
          ...state.tempLocation,
          address: action.payload.address,
          lngLat: action.payload.coords
        }
      };
    case types.INVALIDATE_POSITION:
      return {
        ...state,
        tempLocation: {
          ...state.tempLocation,
          valid: false
        }
      };
    case types.VALIDATE_POSITION:
      return {
        ...state,
        tempLocation: {
          ...state.tempLocation,
          valid: true
        }
      };
    case types.REVERSE_GEOCODE_COMPLETE:
      return { ...state,
        reverseGeocodeResult: action.payload
      };
    case types.SET_TEMP_LOCATION_COORDS:
      return {
        ...state,
        tempLocation: {
          ...state.tempLocation,
          lngLat: action.payload
        }
      };
    case types.SET_TEMP_LOCATION_ADDRESS:
      return {
        ...state,
        tempLocation: {
          ...state.tempLocation,
          address: action.address
        }
      };
    case types.CONFIRM_LOCATION:
      return {
        ...state,
        reverseGeocodeResult: null,
        deviceLocation: null,
        newReport: {
          ...state.newReport,
          address: state.tempLocation.address,
          geometry: {
            type: 'Point',
            coordinates: [
              state.tempLocation.lngLat.lng,
              state.tempLocation.lngLat.lat
            ]
          }
        }
      };
    case types.SET_LOCATION_MODE:
      return { ...state, locationMode: action.mode };
    case types.SET_BIKESTAND_COUNT:
      return {
        ...state,
        newReport: {
          ...state.newReport,
          details: {
            ...state.newReport.details,
            number: action.payload
          }
        }
      };
    case types.SET_FEE_ACCEPTABLE:
      return {
        ...state,
        newReport: {
          ...state.newReport,
          details: {
            ...state.newReport.details,
            fee_acceptable: action.isFeeAcceptable
          }
        }
      };
    case types.SET_ADDITIONAL_DATA:
      return {
        ...state,
        newReport: {
          ...state.newReport,
          ...action.payload
        }
      };
    case types.SUBMIT_REPORT_PENDING:
      return {
        ...state,
        apiRequestStatus: {
          ...state.apiRequestStatus,
          submitting: true
        }
      };
    case types.SUBMIT_REPORT_COMPLETE:
      return {
        ...state,
        apiRequestStatus: {
          submitting: false,
          submitted: true
        },
        newReport: {
          ...state.newReport,
          id: action.submittedReport.id
        }
      };
    case types.SUBMIT_REPORT_ERROR:
      return {
        ...state,
        apiRequestStatus: {
          submitting: false
        }
      };
    default:
      return { ...state };
  }
}

// selectors

const selectors = {};

selectors.getLocationIsModeGeocoding = state => state.locationMode === LOCATION_MODE_GEOCODING;
selectors.getAlreadyPicketLocation = function (state) {
  return idx(state, _ => _.newReport.geometry.coordinates);
}

export {
  actions,
  types,
  selectors,
  initialState
};

export default reducer;
