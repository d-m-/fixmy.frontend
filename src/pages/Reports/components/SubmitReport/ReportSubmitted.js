import React, { PureComponent } from 'react';
import styled from 'styled-components';
import ErrorMessage from '../ErrorMessage';
import Button from '~/components/Button';
import { breakpoints } from '~/styles/utils';
import MeldungAnzeigenMockImg from '~/images/reports/meldunganzeigen-mocked.png';


const Wrapper = styled.div`
  padding: 8px 8px 62px 8px;
  max-width: ${breakpoints.s}px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// TODO: factor this out!. This exact same View is used multiple times within /Reports
const Heading = styled.h3`
  margin-top: 6px;
  font-size: 22px;
  font-weight: bold;
  color: ${config.colors.black};
  text-align: center;
  margin-bottom: 8px;
`;

// TODO: also de-dupe
const Text = styled.p`
  font-size: 14px;
  line-height: 1.4;
  text-align: center;
  color: ${config.colors.darkgrey};
  margin-top: 0;
  margin-bottom: 32px;
`;

// TODO: factor out, used multiple times in other places
const StyledHr = styled.hr`
  width: 100%;
  border: 0.5px dashed rgba(162, 162, 162, 0.87);
  margin-bottom: 12px;
`;

// TODO: Do not use an image, show the overview map with the actual new marker in the background, allow an instant navigation to the map on marker tap
const MeldungAnzeigenImage = styled.img`
  margin-bottom: 6px;
`;

const StyledInput = styled.input`
  width:100%;
  font-size: 16px;
  border:0;
  border-bottom:1px solid #979797;
  outline: none;
  padding: 0;
  margin: 26px 0;
  height: 32px;
  
  &:focus {
    border-bottom:2px solid ${config.colors.interaction};
  }
`;

// TODO: de-dupe
const StyledCheckbox = styled.input`
  cursor: pointer;
  margin-right: 16px;
  display: inline-block;
  transform: scale(1.5);
  transform-origin: top left;
`;

const StyledCheckboxItem = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: ${breakpoints.m}px;
  margin-bottom: 16px;
`;

// TODO: same here
const StyledCheckboxLabel = styled.label`
   font-size: 10px;
   letter-spacing: 0.2px;
   line-height: 1.4;
   color: ${config.colors.darkgrey};
   cursor: pointer;
`;

// TODO: same here
const WeiterButton = styled(Button)`
  display: block;
  margin-top: 36px;
  height: 48px;
  width: 167px;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.2);
  
  &&[disabled] {
    background-color: white;
    color: ${config.colors.darkgrey};
    font-weight: bold;
    cursor: default;
    border: 1px solid ${config.colors.interaction};
    &:hover {
     background-color: ${config.colors.lightgrey};
    }
  }
`;

class ReportSubmitted extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      confirmsDataUsage: false,
      wantsNewsletter: true
    };
  }

  updateEmail = (e) => {
    this.setState({ email: e.target.value });
  };

  toggleByTick = (e) => {
    const stateProperty = e.target.name;
    this.setState(prevState => ({
      [stateProperty]: !prevState[stateProperty]
    }));
  };

  // TODO: wire to endpoint
  submitEmail = () => {
    console.log(`do something with the email ${ this.state.email}`);
  };

  render() {
    const { error } = this.props;

    // TODO: extend error handling. The user should be able to retry the request or at least be navigated back somewhere
    // TODO: factor out leave-email section as component
    if (error.message) return <ErrorMessage message={error.message} />;

    return (
      <Wrapper>
        <Heading>Danke, dass du mithilfst Friedrichshain-Kreuzberg radfreundlicher zu machen!</Heading>
        <Text>Deine Meldung ist nun online und wird am 31. Januar dem Bezirksamt übergeben.</Text>
        <MeldungAnzeigenImage src={MeldungAnzeigenMockImg} />
        <Text>Schau dir Deine Meldung an und erzähle anderen davon</Text>

        <StyledHr />

        <Heading>Gib deine Emailadresse an, damit die Verwaltungsmitarbeiter dir Informationen zum Status deiner Meldung
          schicken können
        </Heading>

        <StyledInput
          name="email"
          type="email"
          placeholder="deine Emailadresse"
          value={this.state.email}
          onChange={this.updateEmail}
        />
        <StyledCheckboxItem>
          <StyledCheckbox
            type="checkbox"
            id="data-usage-tick"
            name="confirmsDataUsage"
            value="true"
            checked={this.state.confirmsDataUsage}
            onChange={this.toggleByTick}
          />
          <StyledCheckboxLabel htmlFor="photo-disclaimer-tick" style={{ alignSelf: 'flex-start' }}>
            Ich willige in die Speicherung meiner Daten zu Zwecken der Benachrichtigung über Projektfortschritte ein.
          </StyledCheckboxLabel>
        </StyledCheckboxItem>

        <StyledCheckboxItem>
          <StyledCheckbox
            type="checkbox"
            id="newsletter-tick"
            name="wantsNewsletter"
            value="true"
            checked={this.state.wantsNewsletter}
            onChange={this.toggleByTick}
          />
          <StyledCheckboxLabel htmlFor="photo-disclaimer-tick" style={{ alignSelf: 'flex-start' }}>
            Ich möchte den FixMyBerlin Newsletter mit Updates zu Planungen erhalten
          </StyledCheckboxLabel>
        </StyledCheckboxItem>

        <WeiterButton
          onClick={this.submitEmail}
          disabled={!this.state.confirmsDataUsage}
        >Absenden
        </WeiterButton>

      </Wrapper>
    );
  }
}

export default ReportSubmitted;