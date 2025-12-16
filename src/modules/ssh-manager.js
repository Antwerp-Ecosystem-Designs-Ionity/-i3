/**
 * ƐÏ3 Browser - SSH Manager
 * SSH backing and support for browser operations
 * 
 * IONITY (PTY) LTD
 */

const { Client } = require('ssh2');

class SSHManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connectionConfig = null;
  }

  /**
   * Connect to SSH server
   * @param {Object} config - SSH configuration {host, port, username, password/privateKey}
   * @returns {Promise<Object>} Connection result
   */
  async connect(config) {
    return new Promise((resolve, reject) => {
      try {
        this.client = new Client();
        
        this.client.on('ready', () => {
          this.isConnected = true;
          this.connectionConfig = config;
          console.log('SSH connection established');
          resolve({ 
            success: true, 
            message: 'SSH connection established',
            host: config.host 
          });
        });

        this.client.on('error', (err) => {
          console.error('SSH connection error:', err);
          this.isConnected = false;
          reject(new Error(`SSH connection failed: ${err.message}`));
        });

        this.client.on('close', () => {
          console.log('SSH connection closed');
          this.isConnected = false;
        });

        // Connect with provided configuration
        this.client.connect({
          host: config.host,
          port: config.port || 22,
          username: config.username,
          password: config.password,
          privateKey: config.privateKey,
          readyTimeout: 10000
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Execute command via SSH
   * @param {string} command - Command to execute
   * @returns {Promise<Object>} Execution result
   */
  async execute(command) {
    if (!this.isConnected || !this.client) {
      throw new Error('SSH not connected. Please connect first.');
    }

    return new Promise((resolve, reject) => {
      this.client.exec(command, (err, stream) => {
        if (err) {
          reject(err);
          return;
        }

        let stdout = '';
        let stderr = '';

        stream.on('close', (code, signal) => {
          resolve({
            success: code === 0,
            exitCode: code,
            signal: signal,
            stdout: stdout,
            stderr: stderr
          });
        });

        stream.on('data', (data) => {
          stdout += data.toString();
        });

        stream.stderr.on('data', (data) => {
          stderr += data.toString();
        });
      });
    });
  }

  /**
   * Disconnect SSH connection
   */
  disconnect() {
    if (this.client) {
      this.client.end();
      this.isConnected = false;
      this.connectionConfig = null;
      console.log('SSH disconnected');
    }
  }

  /**
   * Get connection status
   * @returns {boolean} Connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      host: this.connectionConfig?.host || null
    };
  }
}

module.exports = SSHManager;
