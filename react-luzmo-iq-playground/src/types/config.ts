export interface Config {
  appServer: string;
  apiHost: string;
  authKey: string;
  authToken: string;
}

export interface ConfigurationFormProps {
  onSubmit: (config: Config) => void;
  initialValues: {
    appServer: string;
    apiHost: string;
  };
}
