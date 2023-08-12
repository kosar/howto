# Internet Speed Tracker

The **Internet Speed Tracker** is a Python script that performs periodic speed tests and logs the results in a CSV file. It also checks for significant deviations from the moving average and sends email alerts in such cases.

## Theory of Operation

1. The **Internet Speed Tracker** [script](https://github.com/kosar/howto/blob/main/internet_watcher.py) periodically performs speed tests using the `speedtest-cli` library, fetching both download and upload speeds.
2. The obtained speed test results are then logged in a CSV file. Each entry includes a timestamp, download speed, and upload speed.
3. The script calculates moving averages of both download and upload speeds from the stored CSV data.
4. If the current speed significantly deviates from the moving average (based on a user-defined threshold percentage), the script sends an email alert to notify the user.
5. The script can be executed as a service on devices like the Raspberry Pi to continually monitor and report internet speeds.

## Using Environment Variables

The script uses environment variables to store sensitive information, such as email credentials and server settings, securely. Environment variables are external variables that programs can use to access configuration and authentication data without hardcoding them in the code.

In the context of this script, environment variables are stored in the `env_vars.sh` file. Users must set these variables manually to enable the script to send email alerts.

### How Environment Variables are Used in the Code

The script reads the `env_vars.sh` file at runtime to load the environment variables into the script's execution environment. This is done by parsing the `env_vars.sh` file and setting each variable as an environment variable using the `os.environ` dictionary in Python.

```python
# Read the environment variables from the file and set them
with open(ENV_FILE_PATH, 'r') as env_file:
    for line in env_file:
        if line.strip() and not line.strip().startswith('#'):
            var_name, var_value = line.strip().split('=', 1)
            os.environ[var_name] = var_value.strip('"')
```
By setting the environment variables in this manner, the script gains access to the necessary information (such as email credentials and server details) without hardcoding them in the script itself. This separation of sensitive data and code enhances security and simplifies configuration.
## Setting Up Environment Variables

1. **SENDER_EMAIL**: Set this to the email address from which the alerts will be sent.
2. **RECEIVER_EMAIL**: Set this to the email address that will receive the alerts.
3. **SMTP_SERVER**: Set this to the SMTP server's address (e.g., smtp.gmail.com for Gmail).
4. **SMTP_PORT**: Set this to the SMTP server's port (e.g., 587 for Gmail).
5. **SMTP_USERNAME**: Set this to the SMTP server username (usually your email address).
6. **SMTP_PASSWORD**: Set this to the app password generated for your email account (for enhanced security).

By using environment variables and storing sensitive data in the `env_vars.sh` file, you keep authentication details separate from the codebase. This approach enhances security and allows for easy configuration without exposing sensitive data directly in the code.

### Sample Environment File
```
#!/bin/bash

# Set the environment variables for the script
SENDER_EMAIL="your_sender_email@gmail.com"
RECEIVER_EMAIL="recipient@example.com"
SMTP_SERVER="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USERNAME="your_email@gmail.com"
SMTP_PASSWORD="your_email_password"

```

In this file, you don't need to use the export command like in a typical shell script. The variables are set directly without the export keyword. The script will read these variable assignments and load them into the environment using the provided Python code. Make sure to replace the example values with your actual email and server details.
## Note

It's important to keep the `env_vars.sh` file secure, as it contains sensitive information. Make sure the file's permissions are set appropriately (e.g., read-only for the owner only) to prevent unauthorized access.

## Setup and Installation

### Setting up a Python Virtual Environment 

#### Creating a Virtual Environment (venv)

A virtual environment is a self-contained Python environment that allows you to install packages and dependencies specific to your project, without affecting the system-wide Python installation. This is especially useful when you want to isolate your project's dependencies from other projects and maintain a clean development environment.

To create a virtual environment for the project, follow these steps:
1. Open a terminal on your Raspberry Pi.
2. Navigate to the directory where you have stored your project files
   
`cd /path/to/your/project/directory`

To create a virtual environment, use the following command. Replace myenv with a name of your choice for the virtual environment.

```bash
python3 -m venv myenv
```
This command will create a directory named myenv (or your chosen name) in your project directory. This directory will contain the isolated Python environment.

To activate the virtual environment, use the appropriate command based on your shell:
For Bash or Zsh:

```bash
source myenv/bin/activate
```

After activation, you'll notice that your terminal prompt changes to indicate that you're working within the virtual environment.

With the virtual environment activated, you can now install the required packages for your project. Install the speedtest-cli package using the following command:

```bash
pip install speedtest-cli
```

This will install the speedtest-cli package only within the virtual environment.

Once you're done working with your project and want to exit the virtual environment, simply use the command:

```bash
deactivate
```

This will return you to your system's global Python environment.

By creating a virtual environment for your project, you ensure that the project's dependencies are isolated and won't interfere with other projects or your system-wide Python installation. This practice also promotes a clean and organized development environment.

### Building The Code

1. Clone this repository to your Raspberry Pi.
2. Create a virtual environment (venv) for the project. Make sure to set the path to your venv binary in the script.
3. Install the required libraries by running `pip install -r requirements.txt` inside the virtual environment.
4. Set up email environment variables in the `env_vars.sh` file.
5. Make the `internet_watcher.py` script executable: `chmod +x internet_watcher.py`.
6. Set up the script as a service (optional) using systemd.

## Running the Script

1. Activate your virtual environment: `source path_to_venv/bin/activate`
2. Run the script: `./internet_watcher.py`

## Setting Up as a Service

1. Create a systemd service file (e.g., `internet_watcher.service`) in `/etc/systemd/system/` with the following content:

```
[Unit]
Description=Internet Speed Tracker
After=multi-user.target

[Service]
Type=idle
ExecStart=/path_to_venv/bin/python /path_to_script/internet_watcher.py --interval 600
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

2. Enable the service: `sudo systemctl enable internet_watcher.service`
3. Start the service: `sudo systemctl start internet_watcher.service`

The script will now run at the specified interval and log speed test results.

## Troubleshooting

- Make sure the path to the venv binary is correctly set in the script.
- Ensure that email environment variables are correctly set in the `env_vars.sh` file.
- Check the log messages using `journalctl -u internet_watcher.service`.

