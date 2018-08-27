import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import Link from '~/components/styled/Link';
import ContentPageWrapper from '~/components/ContentPageWrapper';
import UserForm from './UserForm';
import { login } from './UserState';

const StyledLink = styled(Link)`
  margin-top: 16px;
  display: inline-block;
`;

const formConfig = [
  { id: 'email', value: '', type: 'email', label: 'E-Mail', placeholder: 'E-Mail eingeben...', validateError: 'Bitte geben Sie Ihre E-Mail Adresse an.' },
  { id: 'password', value: '', type: 'password', label: 'Passwort', placeholder: 'Passwort eingeben...', validateError: 'Bitte geben Sie Ihr Passwort an.' }
];

class Login extends PureComponent {
  onSubmit = (values, params) => {
    this.props.dispatch(login(values, params));
  }

  render() {
    return (
      <ContentPageWrapper>
        <UserForm
          title="Login"
          buttonLabel="Einloggen"
          formConfig={formConfig}
          onSubmit={this.onSubmit}
        />
        <StyledLink to="/password-reset">
          Passwort vergessen?
        </StyledLink>
      </ContentPageWrapper>
    );
  }
}

export default connect(state => state.UserState)(Login);
