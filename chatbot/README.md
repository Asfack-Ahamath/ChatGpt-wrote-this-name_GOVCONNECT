# GovConnect Chatbot

## 🔒 Git Configuration & Security

### Git Configuration
The following files are tracked in git:

```
# Core Files
config.py              # Configuration with environment variable support
chat_logs.json         # Chat history for analysis
govconnect_nic/       # FAISS index for NIC-related queries
test_env.py           # Environment testing utility
```

Files ignored by git to reduce repository size:

```
# Generated Files
__pycache__/          # Python bytecode
*.pyc                 # Python compiled files

# Environment & IDE
.env                  # Local environment variables
.vscode/             # IDE settings
```

### Setting Up Configuration

1. **Environment Variables**
   ```bash
   cp .env.example .env
   ```

2. **Update Environment**
   Edit `.env` with your actual values:
   - Add your Mistral API key
   - Configure data directories
   - Set other environment-specific values

3. **Configuration Security**
   - Use environment variables for sensitive data
   - Keep `.env` local only (not in git)
   - `config.py` uses environment variables

### 🔧 Clean Git History

If you accidentally committed sensitive files:

1. **Run Clean Script**
   ```bash
   chmod +x scripts/clean_git.sh
   ./scripts/clean_git.sh
   ```

2. **Verify Changes**
   ```bash
   git status
   ```

3. **Commit Changes**
   ```bash
   git commit -m "Remove sensitive files from git tracking"
   ```

## 📁 Directory Structure

```
chatbot/
├── app.py                 # Flask application
├── chatbot_core.py        # Core chatbot logic
├── config.example.py      # Example configuration
├── config.py             # Local configuration (not in git)
├── data/                 # Knowledge base documents
├── govconnect_nic/       # FAISS index (not in git)
├── requirements.txt      # Python dependencies
├── scripts/             # Utility scripts
├── static/              # Static assets
├── templates/           # HTML templates
└── tests/              # Test files (not in git)
```

## 🚀 Development Workflow

1. **Initial Setup**
   ```bash
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   cp config.example.py config.py
   ```

2. **Configure Environment**
   - Update `config.py` with your settings
   - Never commit `config.py`

3. **Run Development Server**
   ```bash
   python run.py
   ```

4. **Before Committing**
   - Check `.gitignore` is up to date
   - Verify no sensitive data in commits
   - Run tests: `python -m pytest`

## 🔐 Security Best Practices

1. **Configuration**
   - Keep `config.py` local
   - Use environment variables
   - Regular key rotation

2. **Data Protection**
   - Chat logs are local only
   - FAISS indices not in git
   - Sanitize user inputs

3. **Development**
   - Use virtual environments
   - Regular dependency updates
   - Code review sensitive changes

## 📝 Maintaining .gitignore

1. **Check Current Status**
   ```bash
   git status --ignored
   ```

2. **Add New Patterns**
   ```bash
   echo "new_pattern/*" >> .gitignore
   ```

3. **Remove Tracked Files**
   ```bash
   git rm --cached <file>
   ```

4. **Update Existing Files**
   ```bash
   git update-index --assume-unchanged <file>
   ```

## 🔍 Troubleshooting

### Common Issues

1. **Sensitive Data Committed**
   - Use `scripts/clean_git.sh`
   - Update passwords/keys
   - Consider repository cleanup

2. **Files Not Ignored**
   - Check `.gitignore` syntax
   - Clear git cache:
     ```bash
     git rm -r --cached .
     git add .
     ```

3. **Config Issues**
   - Compare with `config.example.py`
   - Check environment variables
   - Verify file permissions

### Getting Help

1. Check this README
2. Review `.gitignore`
3. Consult team lead for security concerns
4. Document any new ignore patterns

## 📚 Additional Resources

- [Git Documentation](https://git-scm.com/docs)
- [Python .gitignore Template](https://github.com/github/gitignore/blob/master/Python.gitignore)
- [Security Best Practices](https://git-scm.com/docs/gitignore)