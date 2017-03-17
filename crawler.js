const fetch = require('node-fetch');
const cheerio = require('cheerio');
const striptags = require('striptags');
const PromiseQueue = require('p-queue');
const Pageres = require('pageres');

const BASE_URL = 'http://computas.no';

const SCREENSHOT_DESTINATION = 'public/captures';
const SCREENSHOT_SIZES = ['1680x1050'];

function extractContent(html) {
  const $ = cheerio.load(html);

  const title = $('title').text();
  const contents = striptags($('main').text()).trim();

  const links = $('a')
    .map((i, el) => $(el).attr('href'))
    .get()
    .filter(link => link.startsWith('/'))
    .filter(link => !link.startsWith('/en/') && !link.endsWith('.pdf'))
    .map(path => `${BASE_URL}${path}`);

  return {
    title,
    contents,
    links
  };
}

function processUrl(url) {
  return fetch(url).then(response => response.text()).then(extractContent);
}

function takeScreenshot(url) {
  return new Pageres()
    .src(url, SCREENSHOT_SIZES, { crop: true })
    .dest(SCREENSHOT_DESTINATION)
    .run();
}

function putInRemoteIndex(docs) {
  return fetch(
    `https://abakus-api-dot-sinuous-tine-156112.appspot.com/${process.env.REACT_APP_API_KEY}/put`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(docs)
    }
  )
    .then(response => response.json())
    .then(json => console.error(json));
}

function crawl() {
  const pages = {};
  const queue = new PromiseQueue({ concurrency: 8 });

  const enqueueUrl = url => queue.add(() => {
    if (pages[url]) {
      return Promise.resolve();
    }

    //queue.add(() => takeScreenshot(url));

    return processUrl(url).then(({ title, contents, links }) => {
      pages[url] = { id: url, url, title, contents };
      links.forEach(enqueueUrl);
    });
  });

  enqueueUrl(BASE_URL + '/');

  queue.onEmpty().then(() => {
    console.log(JSON.stringify(Object.values(pages), null, 2));
    putInRemoteIndex(Object.values(pages));
  });
}

crawl();
