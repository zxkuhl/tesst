class KeyGenerator {
    constructor() {
        this.backendFile = 'backend.txt';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadBackend();
    }

    bindEvents() {
        document.getElementById('generateBtn').addEventListener('click', () => this.generateKey());
        document.getElementById('copyBtn').addEventListener('click', () => this.copyKey());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveKey());
        document.getElementById('refreshBtn').addEventListener('click', () => this.loadBackend());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadBackend());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearBackend());
        
        document.querySelectorAll('input[name="keyType"]').forEach(radio => {
            radio.addEventListener('change', () => this.generateKey());
        });
    }

    generateKey() {
        const keyType = document.querySelector('input[name="keyType"]:checked').value;
        let key;

        switch(keyType) {
            case 'uuid':
                key = this.generateUUID();
                break;
            case 'api':
                key = this.generateAPIKey();
                break;
            case 'license':
                key = this.generateLicenseKey();
                break;
        }

        document.getElementById('keyValue').textContent = key;
        document.getElementById('generatedKey').classList.remove('hidden');
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    generateAPIKey() {
        return Array.from({length: 64}, () => 
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(
                Math.floor(Math.random() * 62)
            )
        ).join('');
    }

    generateLicenseKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let key = '';
        for(let i = 0; i < 25; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
            if(i % 5 === 4 && i < 24) key += '-';
        }
        return key;
    }

    copyKey() {
        const key = document.getElementById('keyValue').textContent;
        navigator.clipboard.writeText(key).then(() => {
            const btn = document.getElementById('copyBtn');
            const original = btn.textContent;
            btn.textContent = '✅ Copied!';
            btn.style.background = '#28a745';
            setTimeout(() => {
                btn.textContent = original;
                btn.style.background = '';
            }, 2000);
        });
    }

    async saveKey() {
        const key = document.getElementById('keyValue').textContent;
        const timestamp = new Date().toISOString();
        const entry = `[${timestamp}] ${key}\n`;
        
        try {
            const content = await this.readBackend();
            const updatedContent = content + entry;
            await this.writeBackend(updatedContent);
            this.loadBackend();
            
            const btn = document.getElementById('saveBtn');
            const original = btn.textContent;
            btn.textContent = '✅ Saved!';
            btn.style.background = '#28a745';
            setTimeout(() => {
                btn.textContent = original;
                btn.style.background = '';
            }, 2000);
        } catch (error) {
            alert('Error saving to backend: ' + error.message);
        }
    }

    async loadBackend() {
        try {
            const content = await this.readBackend();
            document.getElementById('backendContent').value = content || 'Backend file is empty...';
        } catch (error) {
            document.getElementById('backendContent').value = 'Error loading backend...';
        }
    }

    async readBackend() {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', this.backendFile, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200 || xhr.status === 0) {
                        resolve(xhr.responseText);
                    } else {
                        resolve('');
                    }
                }
            };
            xhr.send();
        });
    }

    async writeBackend(content) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', this.backendFile, true);
            xhr.setRequestHeader('Content-Type', 'text/plain');
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200 || xhr.status === 201) {
                        resolve();
                    } else {
                        reject(new Error('Failed to save'));
                    }
                }
            };
            xhr.send(content);
        });
    }

    downloadBackend() {
        const content = document.getElementById('backendContent').value;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'backend.txt';
        a.click();
        URL.revokeObjectURL(url);
    }

    async clearBackend() {
        if (confirm('Clear all keys from backend? This cannot be undone.')) {
            try {
                await this.writeBackend('');
                this.loadBackend();
            } catch (error) {
                alert('Error clearing backend: ' + error.message);
            }
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new KeyGenerator();
});
