# Envoy
A lightweight, browser-based API testing tool with a modern interface, request history, and saved collections. Perfect for developers who need a simple way to test and debug HTTP requests. It comes with an intuitive interface, responsive design, and features like request history, multiple authentication methods, and more.

## Features

- **Intuitive Interface**: Clean, modern UI with dark mode support.
  
- **Request Building**:
  - Support for all HTTP methods (GET, POST, PUT, DELETE, etc.)
  - Query parameters builder
  - Headers management
  - JSON request body editor
  - Multiple authentication methods (Basic Auth, API Key)
  
- **Response Handling**:
  - Pretty-printed JSON response formatting
  - Response headers display
  - Status code indication
  - Response time and size metrics
  
- **Productivity Tools**:
  - Request history tracking
  - Save and organize favorite requests
  - Quick request duplication
  - Local storage persistence
  - Configurable timeout settings
  
- **Developer Experience**:
  - Dark/Light theme toggle
  - Keyboard shortcuts
  - Responsive design for all screen sizes

## Technical Stack

- Vanilla JavaScript (ES6+)
- Modern CSS
- Local Storage API
- Axios for HTTP requests

## Usage

- Enter your API endpoint URL.
- Select the HTTP method.
- Add query parameters if needed.
- Set request headers.
- Add request body for POST/PUT requests.
- Choose authentication method if required.
- Click **"Send"** to make the request.
- View the formatted response below.

## Security

- All data is stored locally in your browser.
- No data is sent to any external servers except your specified API endpoints.
- Sensitive information like API keys and passwords are never logged.

