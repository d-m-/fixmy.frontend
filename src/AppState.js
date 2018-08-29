import matchPath from 'react-router/matchPath';

const UPDATE_HISTORY = 'App/AppState/UPDATE_HISTORY';
const SET_ACTIVE_SECTION = 'App/AppState/SET_ACTIVE_SECTION';
const SET_VIEW_ACTIVE = 'App/AppState/SET_VIEW_ACTIVE';
const OPEN_MENU = 'App/AppState/OPEN_MENU';
const CLOSE_MENU = 'App/AppState/CLOSE_MENU';

const initialState = {
  activeView: null,
  activeSection: null,
  isMenuOpen: false
};

export const updateHistory = props => (dispatch) => {
  const match = matchPath(props.pathname, {
    path: '/:activeView?/:activeSection?',
    exact: false,
    strict: false
  });

  const activeSection = match.params.activeSection;
  const activeView = match.params.activeView;

  dispatch({
    type: UPDATE_HISTORY,
    payload: {
      activeSection: isNaN(activeSection) ? null : activeSection,
      activeView
    }
  });
};

export function setActiveSection(activeSection) {
  return { type: SET_ACTIVE_SECTION, payload: { activeSection } };
}

export function setActiveView(activeView) {
  return { type: SET_VIEW_ACTIVE, payload: { activeView } };
}

export function open() {
  return { type: OPEN_MENU };
}

export function close() {
  return { type: CLOSE_MENU };
}

export function toggle() {
  return (dispatch, getState) => {
    const { isMenuOpen } = getState().AppState;

    if (isMenuOpen) {
      return dispatch(close());
    }

    return dispatch(open());
  };
}

export default function AppStateReducer(state = initialState, action = {}) {
  switch (action.type) {
    case OPEN_MENU:
      return Object.assign({}, state, { isMenuOpen: true });
    case CLOSE_MENU:
      return Object.assign({}, state, { isMenuOpen: false });
    case UPDATE_HISTORY:
    case SET_ACTIVE_SECTION:
    case SET_VIEW_ACTIVE:
      return Object.assign({}, state, action.payload);
    default:
      return Object.assign({}, state);
  }
}