import { useState } from "react";
import "./ConfigurationForm.css";
import { ConfigurationFormProps } from "../types/config";

/**
 * Configuration form component specific to this example app.
 * This is not a requirement for Luzmo IQ, but helps to set up
 * the necessary configuration and authentication details.
 *
 * Collects:
 * - App server URL
 * - API host URL
 * - Embed key
 * - Embed token
 *
 * Also provides setup instructions for enabling Luzmo IQ and dataset access.
 */
export function ConfigurationForm({
  onSubmit,
  initialValues,
}: ConfigurationFormProps) {
  const [formData, setFormData] = useState({
    appServer: initialValues.appServer,
    apiHost: initialValues.apiHost,
    authKey: "",
    authToken: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="config-form">
      <h2>Luzmo IQ</h2>
      <p className="form-description">To start with Luzmo IQ:</p>
      <ol className="setup-steps">
        <li>
          Make sure Luzmo IQ is enabled for your account. Contact your customer
          success manager or{" "}
          <a href="mailto:support@luzmo.com">support@luzmo.com</a>.
        </li>
        <li>
          Enable "<strong>AI Insights</strong>" for the datasets you want to
          query. You can do this through the dataset details page in Luzmo.
        </li>
        <li>
          Create an embed key and token with "<strong>use</strong>" rights for
          the relevant datasets. You can create these through the{" "}
          <a
            href="https://developer.luzmo.com/api/createAuthorization"
            target="_blank"
            rel="noopener noreferrer"
          >
            authorization API
          </a>
          .
        </li>
      </ol>
      <hr
        style={{
          border: "none",
          borderTop: "1px solid #eee",
          margin: "2rem 0",
        }}
      />
      <div className="form-group">
        <label htmlFor="appServer">
          App Server:
          <div className="help-text">
            US multi-tenant clients use "https://app.us.luzmo.com/"
          </div>
        </label>
        <input
          type="text"
          id="appServer"
          value={formData.appServer}
          onChange={(e) =>
            setFormData({ ...formData, appServer: e.target.value })
          }
        />
      </div>
      <div className="form-group">
        <label htmlFor="apiHost">
          API Host:
          <div className="help-text">
            US multi-tenant clients use "https://api.us.luzmo.com/"
          </div>
        </label>
        <input
          type="text"
          id="apiHost"
          value={formData.apiHost}
          onChange={(e) =>
            setFormData({ ...formData, apiHost: e.target.value })
          }
        />
      </div>
      <div className="form-group">
        <label htmlFor="authKey">Embed Key:</label>
        <input
          type="text"
          id="authKey"
          value={formData.authKey}
          onChange={(e) =>
            setFormData({ ...formData, authKey: e.target.value })
          }
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="authToken">Embed Token:</label>
        <textarea
          id="authToken"
          value={formData.authToken}
          onChange={(e) =>
            setFormData({ ...formData, authToken: e.target.value })
          }
          required
          rows={3}
          style={{ resize: "vertical" }}
        />
      </div>
      <button type="submit">Connect to Luzmo IQ</button>
    </form>
  );
}
