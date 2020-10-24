import React from 'react';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <a href="https://slack.com/oauth/authorize?client_id=1182059129521.1447672242117&scope=users.profile:write&redirect_uri=http://localhost:3000">Authorize with Slack</a>
      </header>
    </div>
  );
}

export default App;


// https://slack.com/oauth/authorize?client_id=1182059129521.1447672242117&scope=users.profile:write&redirect_uri=http://localhost:3000

// http://localhost:3000/?code=1182059129521.1456927755124.37be7d8e32643d34c429b282eff00481586bac01abc03ef9599c55357793ced1&state=