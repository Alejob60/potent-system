/**
 * MisyBot Universal JavaScript SDK
 * Version: 1.0.0
 * Provides a secure and simple interface to interact with MetaOS from any website.
 */

class MisySDK {
  constructor() {
    this.config = {
      baseUrl: '',
      tenantId: '',
      siteId: '',
      token: '',
      channel: 'web'
    };
    this.events = {};
    this.sessionId = this._getPersistentSession();
  }

  /**
   * Initialize the SDK with tenant configuration
   * @param {Object} config 
   */
  init(config) {
    this.config = { ...this.config, ...config };
    if (!this.config.baseUrl || !this.config.tenantId || !this.config.token) {
      this._error('Missing mandatory configuration (baseUrl, tenantId, token)');
    }
    this._log('Initialized successfully');
    return this;
  }

  /**
   * Send a message to the MetaOS Front-Desk V2
   * @param {string} message 
   * @param {Object} context Additional metadata
   */
  async sendMessage(message, context = {}) {
    const url = `${this.config.baseUrl}/api/v2/gateway/process`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.token}`,
          'x-misy-channel': this.config.channel,
          'x-misy-session-id': this.sessionId
        },
        body: JSON.stringify({
          message,
          context: {
            siteId: this.config.siteId,
            ...context
          }
        })
      });

      const data = await response.json();
      
      if (data.success === false) {
        throw new Error(data.error || 'Unknown error');
      }

      this._trigger('message', data);
      return data;
    } catch (error) {
      this._error(`Failed to send message: ${error.message}`);
      this._trigger('error', error);
      throw error;
    }
  }

  /**
   * Event Listener
   * @param {string} event 
   * @param {Function} callback 
   */
  on(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }

  /**
   * Internal Event Trigger
   */
  _trigger(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(cb => callback(data));
    }
  }

  _getPersistentSession() {
    let sid = localStorage.getItem('misy_sid');
    if (!sid) {
      sid = 'ms_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('misy_sid', sid);
    }
    return sid;
  }

  _log(msg) { console.log(`[MisySDK] ${msg}`); }
  _error(msg) { console.error(`[MisySDK Error] ${msg}`); }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = new MisySDK();
} else {
  window.misy = new MisySDK();
}
