import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

class SubmitReport extends PureComponent {
  render() {
    return (
      <div>
        <h2>This is the new submitReport component</h2>
      </div>
    );
  }
}

export default connect(state => state.SubmitReportState)(SubmitReport);
