/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { PropTypes } from 'react';
import FeedParser from 'feedparser';
import request from 'request';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Home.css';

class Home extends React.Component {
  static propTypes = {
    news: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired,
      contentSnippet: PropTypes.string,
    })).isRequired,
  }
  constructor(props) {
    super(props);
    this.state = { value: '', listNews: [] };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  fetch(feed) {
    const feedparser = new FeedParser();
    feedparser.parent = this;
    feedparser.parent.setState({ listNews: [] });
    if (!feed){
      return;
    }
    console.log(`feed:${feed}`);
    // Define our streams
    const req = request(feed, { timeout: 10000, pool: false });
    req.setMaxListeners(50);
    // Some feeds do not respond without user-agent and accept headers.
    req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36');
    req.setHeader('accept', 'text/html,application/xhtml+xml');

    req.on('error', (error) => {
      // handle any request errors
      console.error(`errr:${error}`);
    });

    req.on('response', function (res) {
      const stream = this; // `this` is `req`, which is a stream

      if (res.statusCode === 200) {
        stream.pipe(feedparser);
      } else {
        this.emit('error', new Error('Bad status code'));
      }
    });

    feedparser.on('error', (error) => {
      // always handle errors
      console.error(error);
    });

    feedparser.on('readable', function () {
      // This is where the action is!
      const stream = this; // `this` is `feedparser`, which is a stream
      const meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
      let item;
      const news = [];
      while (item = stream.read()) {
        console.log(item);
        news.push(item);
      }
console.log(news);
      if (news.length > 0) {
        const oldNews = feedparser.parent.state.listNews;
        oldNews.push(news[0]);
        feedparser.parent.setState({ listNews: oldNews });
        //console.log('Updated state');
      }
    });
  }


  handleChange(event) {
    this.setState({ value: event.target.value.trim() });
  }

  handleSubmit(event) {
    this.fetch(this.state.value);
    event.preventDefault();
  }
  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>Add new feed</h1>
          <form>
            <label-has-for>
              RSS URL:&nbsp;
              <input type="text" value={this.state.value} onChange={this.handleChange} />
            </label-has-for>
            <button onClick={this.handleSubmit}>Submit</button>
          </form>
          <ul>
            {this.state.listNews.map((post, index) =>
              <li key={index}>
                {post.title}
              </li>,
            )}
          </ul>,
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Home);
