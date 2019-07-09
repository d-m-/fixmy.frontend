import React, { PureComponent } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import SearchIcon from '~/images/reports/search.svg';

const debounce = require('lodash.debounce');

const SearchBarWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  border: none;
  width: 100%;
  padding: 15px 50px;
  color: ${config.colors.darkgrey};
  font-size: 14px;
  border-radius: 2px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.24), 0 0 2px 0 rgba(0, 0, 0, 0.12);
  text-align: center;
`;

const StyledSearchIcon = styled(SearchIcon)`
  position: absolute;
  top: 15px;
  right: 12px;
`;

const closeSize = 20;

const SearchReset = styled.div`
  position: absolute;
  right:10px;
  top:12px;
  border-radius: 50%;
  width: ${closeSize}px;
  height: ${closeSize}px;
  background: #ddd;
  color: #555;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1;
  font-weight: 700;
  font-size: 20px;
  cursor:pointer;
  box-shadow: 0 1px 1px 2px rgba(0, 0, 0, 0.12);

  &:hover {
    background: #eee;
  }
`;

class SearchBar extends PureComponent {
  static propTypes = {
    /**
     * Callback that gets the current search string in order to fetch suggestions.
     */
    onSearchEnter: PropTypes.func.isRequired,
    /**
     * Called when the first search String is compiled. Ment to set a flag in the consuming component,
     * e.g. to hide a Tooltip.
     */
    onSearchStart: PropTypes.func,
    /**
     * Callback invoked when the control is being reset,
     * e.g. to clear the results list.
     */
    onSearchReset: PropTypes.func,
    /**
     * Minimum input length that triggers this.props.onSearchEnter()
     * e.g. to clear the results list.
     */
    searchStringMinLength: PropTypes.number,
    /**
     * Amount of milliseconds the invokation of this.props.onSearchEnter() isdelayed
     * since its last invocation.
     */
    debounceTime: PropTypes.number
  }

  static defaultProps = {
    onSearchStart: () => { },
    onSearchReset: () => { },

    searchStringMinLength: 3,
    debounceTime: 1000
  }

  state = {
    searchStarted: false,
    inputValue: ''
  }

  delayedonSearchEnterCallback = debounce(
    this.props.onSearchEnter,
    this.props.debounceTime
    );

  onFormSubmit = (evt) => {
    evt.preventDefault();

    if (!this.state.inputValue) {
      return false;
    }

    return this.props.onSubmit(this.state.inputValue);
  };

  onChange = (evt) => {
    evt.persist();
    const inputValue = evt.target.value;
    this.setState({ inputValue });

    if (!this.state.searchStarted) {
      this.props.onSearchStart();
      this.setState({
        searchStarted: true
      });
    }

    if (inputValue.length >= this.props.searchStringMinLength) {
      this.delayedonSearchEnterCallback(inputValue);
    } else {
      this.props.onSearchReset();
    }
  };

  resetInput = () => {
    this.setState({ inputValue: '' });
  };

  render() {
    return (
      <SearchBarWrapper>
        <SearchInput
          value={this.state.inputValue}
          type="text"
          placeholder="Gib hier eine Adresse ein"
          spellCheck="false"
          autoCapitalize="words"
          onChange={this.onChange}
        />
        {this.state.inputValue ? (
          <SearchReset onClick={this.resetInput}>×</SearchReset>
        ) : <StyledSearchIcon />}
      </SearchBarWrapper>
    );
  }
}

export default SearchBar;
