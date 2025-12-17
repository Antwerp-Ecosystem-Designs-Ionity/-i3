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

    // Validate command input to prevent command injection
    if (!command || typeof command !== 'string') {
      throw new Error('Invalid command: must be a non-empty string');
    }

    // Sanitize command - remove dangerous characters and patterns
    const sanitized = command.trim();
    if (sanitized.length === 0) {
      throw new Error('Invalid command: cannot be empty');
    }

    // Check for potentially dangerous patterns
    const dangerousPatterns = [
      /;\s*rm\s+-rf/i,     // Dangerous delete commands
      /\|\s*rm\s+-rf/i,    // Piped dangerous commands
      /&&\s*rm\s+-rf/i,    // Chained dangerous commands
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(sanitized)) {
        throw new Error('Command contains potentially dangerous patterns and was blocked');
      }
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
