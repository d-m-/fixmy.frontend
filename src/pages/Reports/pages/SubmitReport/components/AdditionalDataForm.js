import React, { PureComponent } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { oneLine } from 'common-tags';
import TextareaAutosize from 'react-autosize-textarea';

import PhotoControlImage from '~/images/reports/photo-control.png';
import Button from '~/components/Button';
import { breakpoints } from '~/styles/utils';


const Wrapper = styled.div`
  padding: 32px 8px 72px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Heading = styled.h3`
  margin: 0;
  font-size: 22px;
  font-weight: bold;
  color: ${config.colors.black};
  text-align: center;
`;

const Hint = styled.p`
  margin-top: 12px;
  margin-bottom: 0;
  font-size: 14px;
  color: ${config.colors.darkgrey};
  text-align: center;
  line-height: 1.4;
`;

const PhotoInput = styled.input`
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: 1;
`;

const PhotoInputImageLabel = styled.label`
  margin-top: 42px;
  display: block;
  height: 83px;
  width: 109px;
  background-image: url(${PhotoControlImage});
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;

  &.has-photo {
    max-width: 218px;
    max-height: 166px;
    width: 100vw;
    height: 100vh;
  }
`;

const PhotoInputLabel = styled.label`
  display: block;
  margin-top: 12px;
  font-size: 14px;
  color: ${config.colors.darkgrey};
`;

const PhotoDisclaimerWrapper = styled.div`
  margin-top: 82px;
  margin-bottom: 52px;
`;

const StyledCheckbox = styled.input`
  cursor: pointer;
  margin-right: 12px;
  display: inline-block;
  transform: scale(1.5);
  transform-origin: top left;
  &&[disabled] {
    cursor: default;
  }
`;

const StyledCheckboxLabel = styled.label`
   font-size: 10px;
   letter-spacing: 0.2px;
   line-height: 1.4;
   color: ${config.colors.darkgrey};
   cursor: pointer;
`;

const DescriptionTextArea = styled(TextareaAutosize)`
  margin-top: 26px;
  width: 90%;
  max-width: ${breakpoints.s}px;
  font-size: 16px;
  padding: 8px;

  &:focus {
    outline-color: ${config.colors.interaction};
  }
`;

// TODO: D.R.Y. -> this is just copied from bikestandsform. Factor this out
const WeiterButton = styled(Button)`
  display: block;
  margin-top: 51px;
  height: 48px;
  width: 167px;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.2);

  &&[disabled] {
    background-color: ${config.colors.lightgrey};
    cursor: default;
    &:hover {
      opacity: 1;
    }
  }
`;


// TODO: Factor out photo input
// TODO: keep photo props (max dimension, quality) in config

class AdditionalDataForm extends PureComponent {
  static resizeImage(dataUrl) {
    const photoDataUrl = dataUrl;
    return new Promise(((resolve) => {
      const maxWidth = 800;
      const maxHeight = 800;
      const image = new Image();
      image.src = photoDataUrl;
      image.onload = function () {
        const { width, height } = image;
        const shouldResize = (width > maxWidth) || (height > maxHeight);

        if (!shouldResize) {
          resolve(photoDataUrl);
        }

        let newWidth;
        let newHeight;

        if (width > height) {
          newHeight = height * (maxWidth / width);
          newWidth = maxWidth;
        } else {
          newWidth = width * (maxHeight / height);
          newHeight = maxHeight;
        }

        const canvas = document.createElement('canvas');

        canvas.width = newWidth;
        canvas.height = newHeight;

        const context = canvas.getContext('2d');

        context.drawImage(this, 0, 0, newWidth, newHeight);

        resolve(canvas.toDataURL('image/jpeg', 1.0));
      };
    }));
  }

  static propTypes = {
    onConfirm: PropTypes.func
  };

  static defaultProps = {
    onConfirm: () => console.log('onConfirm() says implement me')
  };

  constructor(props) {
    super(props);
    this.state = {
      photo: null,
      photoDisclaimerTicked: false,
      description: ''
    };
    this.fileReader = new FileReader();
    this.fileReader.onload = this.handleConvertedPhoto.bind(this);
  }

  submit = () => {
    // TODO: when a photo has been taken but the disclaimer has not been ticked, show a (unintrusive) error hint
    // marshall form data before submit
    const stateToSubmit = { ...this.state };
    delete stateToSubmit.photoDisclaimerTicked;
    this.props.onConfirm(stateToSubmit);
  };

  isSubmittable = () => (this.state.photo !== null && this.state.photoDisclaimerTicked) ||
    this.state.description.length;

  processTakenPhoto = (fileList) => {
    const photo = fileList[0];
    if (!['image/jpg', 'image/jpeg'].includes(photo.type)) {
      alert('Sorry! Nur Photos im Format JPG werden unterstützt.'); // TODO: use/fix addError action and ErrorMessage component
      return;
    }
    this.fileReader.readAsDataURL(photo);
  };

  togglePhotoDisclaimerTicked = () => {
    this.setState(prevState => ({ photoDisclaimerTicked: !prevState.photoDisclaimerTicked }));
  };

  updateDescription = (evt) => {
    this.setState({ description: evt.target.value });
  };

  handleConvertedPhoto(evt) {
    const me = this;
    const photoInBase64 = evt.target.result;
    AdditionalDataForm.resizeImage(photoInBase64)
      .then(resizedPhotoInBase64 => me.setState({ photo: resizedPhotoInBase64 }));
  }

  render() {
    return (
      <Wrapper>
        <Heading>Hier kannst du noch ein Foto ergänzen</Heading>
        <Hint>Das hilft den Planer*innen die Situation vor Ort besser zu verstehen.</Hint>
        <PhotoInputImageLabel
          htmlFor="photo-file-input"
          style={{ backgroundImage: `url(${this.state.photo || PhotoControlImage})` }}
          className={this.state.photo ? 'has-photo' : ''}
        >
          <PhotoInput
            type="file"
            accept="image/*"
            capture="environment"
            id="photo-file-input"
            name="photo-file-input"
            onChange={e => this.processTakenPhoto(e.target.files)}
          />
        </PhotoInputImageLabel>
        <PhotoInputLabel
          htmlFor="photo-file-input"
        >
          {`Foto ${this.state.photo ? 'neu' : ''} aufnehmen`}
        </PhotoInputLabel>

        <PhotoDisclaimerWrapper>
          <StyledCheckboxLabel htmlFor="photo-disclaimer-tick" style={{ alignSelf: 'flex-start' }}>
            <StyledCheckbox
              type="checkbox"
              id="photo-disclaimer-tick"
              name="photo-disclaimer-tick"
              value="true"
              disabled={!this.state.photo}
              className={this.state.photo && 'wiggle'}
              checked={this.state.photoDisclaimerTicked}
              onChange={this.togglePhotoDisclaimerTicked}
            />
            Hiermit bestätige, dich, dass auf den von mir eingestellten Fotos keine Personen abgebildet sind
          </StyledCheckboxLabel>
        </PhotoDisclaimerWrapper>

        <Heading>…oder eine Beschreibung eingeben</Heading>

        <DescriptionTextArea
          rows={4}
          maxRows={8}
          maxLength={140}
          value={this.state.description}
          onChange={this.updateDescription}
          placeholder={oneLine`z.B.: Vor dem Kindergarten ist morgens immer viel
        los besonders Stellplätze für Lastenräder wären hier wichtig. Platz wäre direkt an der Hauswand.`}
        />

        <WeiterButton
          onClick={this.submit}
          disabled={!this.isSubmittable()}
        >Weiter
        </WeiterButton>

      </Wrapper>
    );
  }
}

export default AdditionalDataForm;
