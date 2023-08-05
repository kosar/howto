#!/usr/bin/env python3

import os
import csv
import datetime
import time
import speedtest
import argparse
import logging
import logging.handlers

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
            return download_speed, upload_speed
        else:
            raise ValueError("Speed test output not found")
    except Exception as e:
        logger.warning(f"Error during speed test: {e}")
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

def main(interval):
    script_directory = os.getcwd()
    csv_filename = os.path.join(script_directory, f"{os.path.splitext(os.path.basename(__file__))[0]}.csv")

    # Write the header row if the file does not exist
    write_header_if_not_exists(csv_filename)
    logger.info("Interval: %s seconds", interval)

    while True:
        # Get the current time and date
        now = datetime.datetime.now()

        # Run the speed test
        download_speed, upload_speed = run_speed_test()

        if download_speed is not None and upload_speed is not None:
            # Create a list with the results and timestamp
            data = [now.strftime('%Y-%m-%d %H:%M:%S'), download_speed, upload_speed]

            # Write the results to the CSV file
            write_to_csv(csv_filename, data)

            # Emit log messages with the file location and test speed
            logger.info(f"Internet Speed Test - Date: {data[0]}, Download Speed: {data[1]} Mbps, Upload Speed: {data[2]} Mbps")
            print(f"Internet Speed Test - Date: {data[0]}, Download Speed: {data[1]} Mbps, Upload Speed: {data[2]} Mbps")
        else:
            logger.warning("Speed test failed. Skipping CSV update.")
            print ("Speed test failed. Skipping CSV update.")

        # Sleep for the specified interval (in seconds)
        time.sleep(interval)

if __name__ == "__main__":
    # Get the directory of the script
    script_directory = os.path.dirname(os.path.abspath(__file__))

    parser = argparse.ArgumentParser(description='Run internet speed test and log the results in a CSV file.')
    parser.add_argument('--interval', type=int, default=3600, help='Interval in seconds for the speed test loop.')
    args = parser.parse_args()

    # Use the script's directory to create the CSV file
    csv_filename = os.path.join(script_directory, f"{os.path.splitext(os.path.basename(__file__))[0]}.csv")

    # Write the header row if the file does not exist
    write_header_if_not_exists(csv_filename)

    main(args.interval)
