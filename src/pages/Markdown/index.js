import Loadable from 'react-loadable';

export default Loadable({
  loader: () => import('./Markdown'),
  loading: () => null
});