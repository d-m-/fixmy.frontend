import Loadable from 'react-loadable';

export default Loadable({
  loader: () => import(/* webpackChunkName: "Profile" */ './Profile'),
  loading: () => null
});
