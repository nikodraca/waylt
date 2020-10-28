import React from 'react';

interface AuthContainerProps {
  slackAuthUrl: string;
}

export const AuthContainer = ({ slackAuthUrl }: AuthContainerProps): JSX.Element => {
  return (
    <div>
      <h2>You need to sign in with Slack</h2>
      <a href={slackAuthUrl}>Authorize with Slack</a>
    </div>
  );
};
