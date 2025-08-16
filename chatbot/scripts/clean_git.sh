#!/bin/bash

# Remove files from git tracking but keep them locally
git rm --cached -r __pycache__/
git rm --cached chat_logs.json
git rm --cached config.py
git rm --cached -r govconnect_nic/
git rm --cached test_env.py

# Create a backup of config.py as example
cp config.py config.example.py

# Remove sensitive information from example config
sed -i 's/API_KEY = ".*"/API_KEY = "your_api_key_here"/g' config.example.py
sed -i 's/SECRET_KEY = ".*"/SECRET_KEY = "your_secret_key_here"/g' config.example.py
sed -i 's/DATABASE_URL = ".*"/DATABASE_URL = "your_database_url_here"/g' config.example.py

# Add example config to git
git add config.example.py

echo "Files have been removed from git tracking but kept locally."
echo "A sanitized config.example.py has been created."
echo ""
echo "Next steps:"
echo "1. Review the changes: git status"
echo "2. Commit the changes: git commit -m 'Remove sensitive files from git tracking'"
echo "3. Update your .gitignore file if needed"
