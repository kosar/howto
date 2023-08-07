#!/usr/bin/env python3

import os
import csv
import datetime
import time
import speedtest
import argparse
import logging
import logging.handlers
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

def load_env_vars(file_path):
    """Load environment variables from a shell script file."""
    try:
        with open(file_path, 'r') as env_file:
            for line in env_file:
                if line.strip() and not line.strip().startswith('#'):
                    var_name, var_value = line.strip().split('=', 1)
                    os.environ[var_name] = var_value.strip('"')
    except Exception as e:
        print(f"Error loading environment variables: {e}")

def log_env_vars():
    for var_name, var_value in os.environ.items():
        logger.info(f"Environment Variable: {var_name}={var_value}")

def send_email(subject, body, attachment_path=None):
    sender_email = os.environ.get("SENDER_EMAIL")
    receiver_email = os.environ.get("RECEIVER_EMAIL")
    smtp_server = os.environ.get("SMTP_SERVER")
    smtp_port = int(os.environ.get("SMTP_PORT"))
    smtp_username = os.environ.get("SMTP_USERNAME")
    smtp_password = os.environ.get("SMTP_PASSWORD")

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'plain'))

    if attachment_path:
        with open(attachment_path, "rb") as attachment:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(attachment.read())

        encoders.encode_base64(part)
        part.add_header(
            "Content-Disposition",
            f"attachment; filename= {os.path.basename(attachment_path)}",
        )

        msg.attach(part)

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.sendmail(sender_email, receiver_email, msg.as_string())
            logger.info("Email sent successfully.")
        print("Email sent successfully.")
    except Exception as e:
        print(f"Error sending email: {e}")
        logger.info(f"Error sending email: {e}")

# Generate LOG_FILENAME dynamically based on the current folder and script name
LOG_FILENAME = os.path.join(os.path.dirname(os.path.abspath(__file__)), f"{os.path.splitext(os.path.basename(__file__))[0]}.log")

# Initialize the logging module
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Add syslog handler to send log messages to journalctl
syslog_handler = logging.handlers.SysLogHandler(address='/dev/log')
formatter = logging.Formatter('%(asctime)s - %(levelname)s: %(message)s')
syslog_handler.setFormatter(formatter)
logger.addHandler(syslog_handler)

# Emit a log message when the script starts
current_time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
logger.info(f"{current_time} - Internet Speed Tracker script started.")

def check_speedtest_module():
    try:
        import speedtest
        return True
    except ImportError:
        return False

# Check if the speedtest module is available
if not check_speedtest_module():
    logger.error("Error: speedtest module is not installed. Please install it using 'pip install speedtest-cli'")
    exit(1)

import subprocess

def run_speed_test():
    try:
        # Run the speedtest-cli command with the --secure option and capture the output
        command = ['/home/pi/src/internet_watcher/watcher1/bin/speedtest', '--secure']
        result = subprocess.run(command, capture_output=True, text=True)

        # Parse the output to extract download and upload speeds
        lines = result.stdout.strip().split('\n')
        download_line = next((line for line in lines if line.startswith('Download:')), None)
        upload_line = next((line for line in lines if line.startswith('Upload:')), None)

        if download_line and upload_line:
            download_speed = float(download_line.split()[1])
            upload_speed = float(upload_line.split()[1])
            # Get the current timestamp
            timestamp = datetime.datetime.now()
            return timestamp, download_speed, upload_speed
        else:
            raise ValueError("Speed test output not found")
    except Exception as e:
        logger.warning(f"Error during speed test: {e}")
        return None, None, None


def calculate_moving_average(filename, num_records):
    try:
        with open(filename, 'r', newline='') as file:
            reader = csv.DictReader(file)
            download_speeds = []
            upload_speeds = []
            
            for row in reader:
                download_speeds.append(float(row['Download Speed (Mbps)']))
                upload_speeds.append(float(row['Upload Speed (Mbps)']))
                
            download_average = sum(download_speeds[-num_records:]) / len(download_speeds[-num_records:])
            upload_average = sum(upload_speeds[-num_records:]) / len(upload_speeds[-num_records:])
            
            return download_average, upload_average
    except Exception as e:
        logger.warning(f"Error calculating moving average: {e}")
        return None, None

def write_header_if_not_exists(filename):
    if not os.path.exists(filename):
        with open(filename, 'w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['Timestamp', 'Download Speed (Mbps)', 'Upload Speed (Mbps)'])

def write_to_csv(filename, data):
    try:
        with open(filename, 'a', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(data)
        logger.info(f"CSV updated: {filename}, Data: {data}")
    except Exception as e:
        logger.error(f"Error writing to CSV: {filename}, Error: {e}")

def log_arguments(args):
    logger.info("Arguments:")
    for arg, value in vars(args).items():
        logger.info(f"{arg}: {value}")

def main(interval, moving_average_records, threshold_percentage):
    script_directory = os.getcwd()
    csv_filename = os.path.join(script_directory, f"{os.path.splitext(os.path.basename(__file__))[0]}.csv")

    # Write the header row if the file does not exist
    write_header_if_not_exists(csv_filename)
    # Log all the argument values (including defaults) at the start
    log_arguments(args)
    
    while True:
        # Run the speed test and get the timestamp, download speed, and upload speed
        timestamp, download_speed, upload_speed = run_speed_test()

        if download_speed is not None and upload_speed is not None:
            # Create a list with the results and timestamp
            data = [timestamp.strftime('%Y-%m-%d %H:%M:%S'), download_speed, upload_speed]

            # Write the results to the CSV file
            write_to_csv(csv_filename, data)

            # Emit log messages with the file location and test speed
            logger.info(f"Internet Speed Test - Date: {data[0]}, Download Speed: {data[1]} Mbps, Upload Speed: {data[2]} Mbps")
            print(f"Internet Speed Test - Date: {data[0]}, Download Speed: {data[1]} Mbps, Upload Speed: {data[2]} Mbps")

            # Calculate the moving average
            download_avg, upload_avg = calculate_moving_average(csv_filename, moving_average_records)

            if download_avg is not None and upload_avg is not None:
                # Check if the latest speed test results deviate from the average by more than the threshold percentage
                download_diff = abs(download_speed - download_avg) / download_avg * 100
                upload_diff = abs(upload_speed - upload_avg) / upload_avg * 100

                if download_diff > threshold_percentage or upload_diff > threshold_percentage:
                    logger.warning(f"Significant deviation from moving average - Download: {download_diff:.2f}%, Upload: {upload_diff:.2f}%")
                    # You can add your alerting mechanism here
                    try:
                        # Get the CSV file path to attach it to the email
                        csv_file_path = os.path.join(script_directory, f"{os.path.splitext(os.path.basename(__file__))[0]}.csv")

                        # Include the interesting metric in the email subject
                        subject = f"Speed Alert - D:{download_diff:.2f}% U:{upload_diff:.2f}%"
                        
                        # Find max values for upload and download in the last `moving_average_records` entries
                        with open(csv_filename, 'r', newline='') as file:
                            reader = csv.DictReader(file)
                            download_values = [float(row['Download Speed (Mbps)']) for row in reader]
                        max_download = max(download_values[-moving_average_records:])
                        
                        with open(csv_filename, 'r', newline='') as file:
                            reader = csv.DictReader(file)
                            upload_values = [float(row['Upload Speed (Mbps)']) for row in reader]
                        max_upload = max(upload_values[-moving_average_records:])
                        
                        message_body = f"D: {download_speed:.2f} Mbps (Max: {max_download:.2f} Mbps), U: {upload_speed:.2f} Mbps (Max: {max_upload:.2f} Mbps)\n"
                        send_email(subject, message_body, attachment_path=csv_file_path)
                    except Exception as e:
                        logger.warning(f"Error during email alert: {e}")

        else:
            logger.warning("Speed test failed. Skipping CSV update.")
            print ("Speed test failed. Skipping CSV update.")

        # Sleep for the specified interval (in seconds)
        time.sleep(interval)

if __name__ == "__main__":
    # Get the directory of the script
    script_directory = os.path.dirname(os.path.abspath(__file__))
    
    # Load environment variables from the env_vars.sh file
    env_file_path = os.path.join(script_directory, "env_vars.sh")
    load_env_vars(env_file_path)

    # Log loaded environment variables for debugging
    log_env_vars()

    parser = argparse.ArgumentParser(description='Run internet speed test and log the results in a CSV file.')
    parser.add_argument('--interval', type=int, default=3600, help='Interval in seconds for the speed test loop.')
    parser.add_argument('--moving-average-records', type=int, default=5, help='Number of records to consider for moving average calculation.')
    parser.add_argument('--threshold-percentage', type=float, default=30, help='Threshold percentage for alert generation.')
    args = parser.parse_args()

    # Use the script's directory to create the CSV file
    csv_filename = os.path.join(script_directory, f"{os.path.splitext(os.path.basename(__file__))[0]}.csv")

    # Write the header row if the file does not exist
    write_header_if_not_exists(csv_filename)

    main(args.interval, args.moving_average_records, args.threshold_percentage)

