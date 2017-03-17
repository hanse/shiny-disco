import React, { Component } from 'react';
import annyang from 'annyang';
import Carousel from 'react-slick';
//import lunr from 'lunr';
import debounce from 'debounce';
import filenameify from 'filenamify-url';
//import searchData from '../result.json';
import './App.css';

// Offline client-side search
//
// const index = lunr(function() {
//   this.field('title');
//   this.field('content', { boost: 10 });
//   this.ref('url');
// });
//
// searchData.forEach(page => index.add(page));
//
// const store = searchData.reduce(
//   (acc, item) => {
//     acc[item.url] = item;
//     return acc;
//   },
//   {}
// );

function remoteSearch(query) {
  return fetch(
    `https://abakus-api-dot-sinuous-tine-156112.appspot.com/${process.env.REACT_APP_API_KEY}/search`,
    {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ query })
    }
  ).then(response => response.json());
}

class App extends Component {
  state = {
    query: '',
    results: []
  };

  componentDidMount() {
    annyang.addCommands({
      'show me *tag': query => {
        this.setState({ query }, () => this.search());
      }
    });
    annyang.start();
  }

  handleQueryChange = e => {
    this.setState({ query: e.target.value });
    this.search();
  };

  handleSearch = e => {
    e.preventDefault();
    this.search();
  };

  search = debounce(
    () => {
      if (!this.state.query) {
        this.setState({ results: [] });
        return;
      }
      this.setState({ searching: true, results: [] });
      remoteSearch(this.state.query).then(
        data => {
          console.log(data);
          this.setState({ results: data.results, searching: false });
        },
        () => this.setState({ searching: false })
      );
    },
    250
  );

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h1>Computas Search</h1>
          <form onSubmit={this.handleSearch}>
            <input
              type="search"
              placeholder="Search..."
              value={this.state.query}
              onChange={this.handleQueryChange}
            />
            <button type="submit"><i className="ion-ios-search" /></button>
          </form>
          <div style={{ padding: 20 }}>
            <strong>
              Don't fancy text inputs? Try saying it out loud
            </strong>
            :{' '}
            <samp>show me java</samp>
          </div>
        </div>

        {this.state.results.length > 0 &&
          <Carousel dots arrows draggable>
            {this.state.results.slice(0, 10).map((result, i) => {
              return (
                <div key={i} className="App-searchResult">
                  <a href={result.url} className="App-goToPageButton">Open →</a>
                  <img
                    className="App-searchResultImage"
                    src={
                      `/captures/${filenameify(result.url)}-1680x1050-cropped.png`
                    }
                  />
                </div>
              );
            })}
          </Carousel>}

        <p className="App-searchResult--noResults">
          {this.state.searching
            ? 'Searching...'
            : this.state.query &&
                this.state.results.length === 0 &&
                'No Results'}
        </p>

        {this.state.results.length > 0 &&
          <p style={{ textAlign: 'center', padding: 40 }}>
            Use
            {' '}
            <kbd><i className="ion-ios-arrow-round-back" /></kbd>
            {' '}
            <kbd><i className="ion-ios-arrow-round-forward" /></kbd>
            {' '}
            to navigate.
          </p>}
      </div>
    );
  }
}

export default App;
