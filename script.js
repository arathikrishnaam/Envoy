// Utility functions
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

class APITestingTool {
  constructor() {
    this.history = [];
    this.savedRequests = [];
    this.bindElements();
    this.attachEventListeners();
    this.loadFromLocalStorage();
  }

  bindElements() {
    // Main form elements
    this.urlInput = $('[data-url]');
    this.methodSelect = $('[data-method]');
    this.queryParamsList = $('[data-query-params]');
    this.requestHeadersList = $('[data-request-headers]');
    this.authTypeSelect = $('[data-auth-type]');
    this.jsonRequestBody = $('[data-json-request-body]');
    this.timeoutInput = $('[data-timeout]');
    this.submitButton = $('[data-submit-form]');

    // Response elements
    this.responseSection = $('[data-response-section]');
    this.statusElement = $('[data-status]');
    this.timeElement = $('[data-time]');
    this.sizeElement = $('[data-size]');
    this.responseBodyElement = $('[data-response-body]');
    this.responseHeadersElement = $('[data-response-headers]');

    // History and saved requests
    this.historyList = $('[data-history-list]');
    this.savedRequestsList = $('[data-saved-requests-list]');
    this.saveRequestButton = $('[data-save-request]');

    // Other controls
    this.darkModeToggle = $('[data-dark-mode-toggle]');
    this.addQueryParamButton = $('[data-add-query-param]');
    this.addHeaderButton = $('[data-add-header]');
  }

  attachEventListeners() {
    this.submitButton.addEventListener('click', () => this.handleSubmit());
    this.addQueryParamButton.addEventListener('click', () => this.addQueryParam());
    this.addHeaderButton.addEventListener('click', () => this.addHeader());
    this.saveRequestButton.addEventListener('click', () => this.saveCurrentRequest());
    this.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
    this.authTypeSelect.addEventListener('change', () => this.handleAuthTypeChange());
  }

  createKeyValueInput(list, type) {
    const li = document.createElement('li');
    li.innerHTML = `
      <input type="text" placeholder="Key" class="${type}-key">
      <input type="text" placeholder="Value" class="${type}-value">
      <button class="remove-btn">Remove</button>
    `;
    
    li.querySelector('.remove-btn').addEventListener('click', () => li.remove());
    list.appendChild(li);
  }

  addQueryParam() {
    this.createKeyValueInput(this.queryParamsList, 'param');
  }

  addHeader() {
    this.createKeyValueInput(this.requestHeadersList, 'header');
  }

  getQueryParams() {
    const params = {};
    this.queryParamsList.querySelectorAll('li').forEach(li => {
      const key = li.querySelector('.param-key').value.trim();
      const value = li.querySelector('.param-value').value.trim();
      if (key) params[key] = value;
    });
    return params;
  }

  getHeaders() {
    const headers = {};
    this.requestHeadersList.querySelectorAll('li').forEach(li => {
      const key = li.querySelector('.header-key').value.trim();
      const value = li.querySelector('.header-value').value.trim();
      if (key) headers[key] = value;
    });
    return headers;
  }

  async handleSubmit() {
    try {
      const startTime = Date.now();
      const config = {
        url: this.urlInput.value,
        method: this.methodSelect.value,
        headers: this.getHeaders(),
        params: this.getQueryParams(),
        timeout: parseInt(this.timeoutInput.value) || 5000
      };

      if (this.jsonRequestBody.value.trim()) {
        try {
          config.data = JSON.parse(this.jsonRequestBody.value);
        } catch (e) {
          alert('Invalid JSON in request body');
          return;
        }
      }

      // Add authentication if selected
      this.addAuthToConfig(config);

      const response = await axios(config);
      const endTime = Date.now();

      this.displayResponse(response, endTime - startTime);
      this.addToHistory(config, response);
    } catch (error) {
      this.handleError(error);
    }
  }

  addAuthToConfig(config) {
    const authType = this.authTypeSelect.value;
    if (authType === 'API Key') {
      const apiKey = $('[data-api-key]')?.value;
      if (apiKey) {
        config.headers['Authorization'] = `Bearer ${apiKey}`;
      }
    } else if (authType === 'Basic Auth') {
      const username = $('[data-basic-auth-username]')?.value;
      const password = $('[data-basic-auth-password]')?.value;
      if (username && password) {
        config.auth = { username, password };
      }
    }
  }

  displayResponse(response, time) {
    this.responseSection.classList.remove('d-none');
    this.statusElement.textContent = `${response.status} ${response.statusText}`;
    this.timeElement.textContent = time;
    this.sizeElement.textContent = new Blob([JSON.stringify(response.data)]).size;
    
    // Pretty print JSON response
    this.responseBodyElement.textContent = JSON.stringify(response.data, null, 2);
    
    // Display response headers
    this.responseHeadersElement.innerHTML = Object.entries(response.headers)
      .map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`)
      .join('');
  }

  handleError(error) {
    this.responseSection.classList.remove('d-none');
    this.statusElement.textContent = error.response?.status || 'Error';
    this.responseBodyElement.textContent = JSON.stringify({
      error: error.message,
      details: error.response?.data
    }, null, 2);
  }

  addToHistory(config, response) {
    const historyItem = {
      timestamp: new Date().toISOString(),
      config,
      response: {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      }
    };
    
    this.history.unshift(historyItem);
    this.updateHistoryList();
    this.saveToLocalStorage();
  }

  updateHistoryList() {
    this.historyList.innerHTML = this.history
      .map((item, index) => `
        <li>
          <div>${item.config.method} ${item.config.url}</div>
          <div>Status: ${item.response.status}</div>
          <div>${new Date(item.timestamp).toLocaleString()}</div>
          <button onclick="apiTester.loadHistoryItem(${index})">Load</button>
        </li>
      `)
      .join('');
  }

  loadHistoryItem(index) {
    const item = this.history[index];
    if (!item) return;

    this.urlInput.value = item.config.url;
    this.methodSelect.value = item.config.method;
    this.jsonRequestBody.value = item.config.data ? 
      JSON.stringify(item.config.data, null, 2) : '';

    // Load query params
    this.queryParamsList.innerHTML = '';
    Object.entries(item.config.params || {}).forEach(([key, value]) => {
      this.addQueryParam();
      const li = this.queryParamsList.lastElementChild;
      li.querySelector('.param-key').value = key;
      li.querySelector('.param-value').value = value;
    });

    // Load headers
    this.requestHeadersList.innerHTML = '';
    Object.entries(item.config.headers || {}).forEach(([key, value]) => {
      this.addHeader();
      const li = this.requestHeadersList.lastElementChild;
      li.querySelector('.header-key').value = key;
      li.querySelector('.header-value').value = value;
    });
  }

  saveCurrentRequest() {
    const name = prompt('Enter a name for this request:');
    if (!name) return;

    const savedRequest = {
      name,
      url: this.urlInput.value,
      method: this.methodSelect.value,
      params: this.getQueryParams(),
      headers: this.getHeaders(),
      body: this.jsonRequestBody.value,
      timeout: this.timeoutInput.value
    };

    this.savedRequests.push(savedRequest);
    this.updateSavedRequestsList();
    this.saveToLocalStorage();
  }

  updateSavedRequestsList() {
    this.savedRequestsList.innerHTML = this.savedRequests
      .map((request, index) => `
        <li>
          <div>${request.name}</div>
          <div>${request.method} ${request.url}</div>
          <button onclick="apiTester.loadSavedRequest(${index})">Load</button>
          <button onclick="apiTester.deleteSavedRequest(${index})">Delete</button>
        </li>
      `)
      .join('');
  }

  loadSavedRequest(index) {
    const request = this.savedRequests[index];
    if (!request) return;

    this.urlInput.value = request.url;
    this.methodSelect.value = request.method;
    this.timeoutInput.value = request.timeout;
    this.jsonRequestBody.value = request.body;

    // Load saved query params
    this.queryParamsList.innerHTML = '';
    Object.entries(request.params).forEach(([key, value]) => {
      this.addQueryParam();
      const li = this.queryParamsList.lastElementChild;
      li.querySelector('.param-key').value = key;
      li.querySelector('.param-value').value = value;
    });

    // Load saved headers
    this.requestHeadersList.innerHTML = '';
    Object.entries(request.headers).forEach(([key, value]) => {
      this.addHeader();
      const li = this.requestHeadersList.lastElementChild;
      li.querySelector('.header-key').value = key;
      li.querySelector('.header-value').value = value;
    });
  }

  deleteSavedRequest(index) {
    if (confirm('Are you sure you want to delete this saved request?')) {
      this.savedRequests.splice(index, 1);
      this.updateSavedRequestsList();
      this.saveToLocalStorage();
    }
  }

  handleAuthTypeChange() {
    const authType = this.authTypeSelect.value;
    const existingAuthInputs = $('[data-auth-inputs]');
    if (existingAuthInputs) {
      existingAuthInputs.remove();
    }

    if (authType) {
      const authInputsDiv = document.createElement('div');
      authInputsDiv.setAttribute('data-auth-inputs', '');

      if (authType === 'API Key') {
        authInputsDiv.innerHTML = `
          <label for="api-key">API Key:</label>
          <input type="password" id="api-key" data-api-key>
        `;
      } else if (authType === 'Basic Auth') {
        authInputsDiv.innerHTML = `
          <label for="username">Username:</label>
          <input type="text" id="username" data-basic-auth-username>
          <label for="password">Password:</label>
          <input type="password" id="password" data-basic-auth-password>
        `;
      }

      this.authTypeSelect.parentNode.appendChild(authInputsDiv);
    }
  }

  toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  }

  saveToLocalStorage() {
    localStorage.setItem('apiTesterHistory', JSON.stringify(this.history));
    localStorage.setItem('apiTesterSavedRequests', JSON.stringify(this.savedRequests));
  }

  loadFromLocalStorage() {
    try {
      this.history = JSON.parse(localStorage.getItem('apiTesterHistory')) || [];
      this.savedRequests = JSON.parse(localStorage.getItem('apiTesterSavedRequests')) || [];
      this.updateHistoryList();
      this.updateSavedRequestsList();

      // Load dark mode preference
      if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }
  }
}

// Initialize the API Testing Tool
const apiTester = new APITestingTool();