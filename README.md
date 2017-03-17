# Search

This project provides a search interface to the computas.no website.

## Installation
```js
brew install yarn
yarn
yarn start
```

## Live Demo
A live demo of the system is available at https://cx.koren.im. It probably works best in Google Chrome.

![Screenshot](https://d3uepj124s5rcx.cloudfront.net/items/0M2E2Z2y2m2j3V1S1N3w/Screen%20Shot%202017-03-17%20at%2016.46.31.png)

## Description

The system essentially consist of three distinct parts:

### [Crawler](https://github.com/Hanse/shiny-disco/blob/master/crawler.js)
The crawler starts at computas.no and extracts the title, content and all links on each page, and puts the internal links in the extraction work queue. When all links are resolved and bodies parsed, the crawler outputs a JSON site map that can be fed to the offline indexer and/or sent to the remote ElasticSearch instance. In addition to extracting the basic content, the crawler will also take a screenshot of the current page, that is later used as previews in the search results listings. The crawler attempts to clean the main content of the page by stripping all the html tags inside the `<main>` element of computas.no.

### Indexer
Items are indexed by a remote ElasticSearch instance.

### User Interface
The interface is implemented as a regular web application enhanced with speech recognition abilities for an even easier way to express queries. The recognition is built using the [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) implemented in modern browsers. All results are presented as SCREENSHOTS of the resulting page in a carousel with a link to open the page to minimize the time taken to inspect the results.
