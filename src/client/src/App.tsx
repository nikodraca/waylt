import React from 'react';

function App() {
  const {REACT_APP_SLACK_CLIENT_ID, REACT_APP_SLACK_REDIRECT_URI} = process.env
  const slackAuthUrl = `https://slack.com/oauth/authorize?client_id=${REACT_APP_SLACK_CLIENT_ID}&scope=users.profile:write&redirect_uri=${REACT_APP_SLACK_REDIRECT_URI}`

  return (
    <div className="App">
      <header className="App-header">
        <a href={slackAuthUrl}>Authorize with Slack</a>
      </header>
    </div>
  );
}

export default App;