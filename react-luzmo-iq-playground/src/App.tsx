import "./App.css";
import { LuzmoIQChatComponent } from "@luzmo/react-embed";
import { ConfigurationForm } from "./components/ConfigurationForm";
import { AuthorizationInfo } from "./components/AuthorizationInfo";
import { useConfigState } from "./hooks/useConfigState";
import { CopyLinkButton } from "./components/CopyLinkButton";

/**
 * Main application component that manages the flow between configuration,
 * authorization checking, and the Luzmo IQ chat interface.
 *
 * The app has three states:
 * 1. Configuration form - when no auth credentials are present
 * 2. Authorization info - after credentials are provided, shows accessible datasets
 * 3. Luzmo IQ hat interface - the main Luzmo IQ chat component
 */
function App() {
  // Use custom hook to manage configuration state and URL parameters
  const {
    config,
    showChat,
    setShowChat,
    handleConfigSubmit,
    defaultAppServer,
    defaultApiHost,
    resetConfig,
  } = useConfigState();

  return (
    <div className="container">
      {!config.authKey || !config.authToken ? (
        <ConfigurationForm
          onSubmit={handleConfigSubmit}
          initialValues={{
            appServer: defaultAppServer,
            apiHost: defaultApiHost,
          }}
        />
      ) : !showChat ? (
        <AuthorizationInfo
          authKey={config.authKey}
          authToken={config.authToken}
          apiHost={config.apiHost}
          onStartChat={() => setShowChat(true)}
          onReset={resetConfig}
        />
      ) : (
        /* Show the main Luzmo IQ chat interface */
        <div className="chat-container">
          <CopyLinkButton />
          <LuzmoIQChatComponent
            appServer={config.appServer}
            apiHost={config.apiHost}
            authKey={config.authKey}
            authToken={config.authToken}
            options={{
              areChartActionsEnabled: true,
              isChartExportEnabled: true,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
