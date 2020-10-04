# Turning your raspberry pi into a print server
This article documents how I recycled an old USB printer

## USB Printers & The Advent of Wireless Networks
USB Printers are designed to "just work" with most modern host devices (computers, phones, etc). 
The original USB printer specification was purposefully designed to allow a lowest-common denominator experience so that anyone could print without a ton of configuration. 
Over time the USB connection turned into a challenge as WiFi and other wireless standards emerged. 
This led to a splintering of the printer ecosystem and a bunch of frankenstein-like standards that attempted to
marry the simplicity of a cable plugged into a computer with the power of a wireless network. USB printer protocols were jammed on to the IP stack, losing 
a great deal of the simplicity that USB drove into the PC ecosystem. Over time, the splintering was pasted over by scrappy open-source mechanisms that embraced
the notion of a host-to-device protocol such as USB, exposing that protocol on the 'wire' using standard mechanisms for remote printing.

## CUPS -- the scrappy mechanism that came to the rescue!
In the Unix operating system (which inspired much of the open source Linux variant) we can rely on a modular printer subsystem, patterned after common Unix practices. Unlike other
printing abstraction concepts (such as the USB Printer specification) the Unix approach was to define a way that a computer could turn into a print server in an open & free way. 
The original name of this Unix-based system: [Common Unix Printing System](https://en.wikipedia.org/wiki/CUPS). Today that system, which used to be the domain of big computers,
can run on pretty much any linux or unix variant. CUPS can therefore provide a local network (such as the one in a home network) with printer services. 

## Raspberry Pi as a Print Server -- with a twist
There are many articles on the internet about how to set up a Raspberry Pi, and how to install the CUPS subsystem. As a fan of the Raspberry Pi, and of a tool I use in my work
(Jupyter) I put the two together to allow me to set up & maintain the system without having to `ssh` into the Raspberry Pi. The Jupyter environment allows me an easy way to 
administer the Raspberry Pi (update it, or trouble shoot it), and to write simple scripts that may be needed to make it an easy function to keep running smoothly. After all, 
this whole solution was built to allow my wife to use the Dymo Label Writer printer that she loved so much, from her new Mac Computer.  I needed to make it fool proof. 

Another piece that I added to the mix -- I made it easy to "find" the print server on a home network using the name of the Raspberry Pi (rather than the local `IP Address` that
may change from time to time. 

## The Pieces Of the Print Server: CUPS + Jupyter Server + Network Discovery
The solution I came up with uses three components running on the Raspberry Pi `Raspbian` (the default one) Operating System. 
1. Avahi Daemon -- the network discovery component that makes the Raspberry Pi visible on your home network
2. CUPS -- the printer subsystem & the Printer control panel
3. Jupyter -- the "administration" control panel for the entier system

### Installation
This is the raw step-by-step to get these set up
1. Install Raspbian for your Raspberry Pi (tons of instructions on this on the public internet)
2. Enable ssh for your Raspberry Pi (tons of instructions)
3. SSH into your Raspberry Pi and create a folder called `src` (or whatever you want it to be)
You should see something like this once you log in via SSH (in this case the name of the Raspberry Pi is `jupyter4`)

```
$ ssh jupyter4.local
Linux jupyter4 4.19.97+ #1294 Thu Jan 30 13:10:54 GMT 2020 armv6l

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Wed Aug  5 08:17:44 2020
pi@jupyter4:~ $ 
```

4. Create a file `start_jupyter_lab.sh` and put in these contents
```
PATH=$PATH:/home/pi/.local/bin
cd /home/pi/src
jupyter lab --ip 0.0.0.0 --port 8888 --no-browser --NotebookApp.token=''
```
**Make sure you mark that file "executable" by doing this:**
`chmod +x start_jupyter_lab.sh`

5. Install the Network Discovery support so that this Raspberry Pi is "discoverable"
```
sudo apt-get install avahi-utils&&sudo systemctl enable avahi-daemon.service&&sudo systemctl start avahi-daemon.service
```
Now your Raspberry Pi should be visible on your home network. Optionally, if you can "find" it on your home network (e.g., in Finder on Mac) 
you can rest assured that the discovery bit is working. 

6. Run the `start_jupyter_lab.sh` during startup
To ensure that the jupyter server starts whenever your Raspberry Pi starts, you will need to modify the `rc.local` to allow this. 
To do this, edit the rc.local file like this:
`sudo nano /etc/rc.local`

That will bring up the file used during the raspberry pi boot sequence where you will add a command to run your script above. Once you open 
that file using the `nano` editor, just add these lines right above the `exit 0` line at the bottom of the file:
```
# Start jupyter
su pi -c 'bash /home/pi/src/start_jupyter_lab.sh&'
```

Now save the file. That will ensure that on any system start, the script we wrote to start the jupyter server will execute. Next we will install 
that server. 

7. Install the Jupyter package and add its path to your default user (pi)
```
sudo pip3 install jupyter&&pip3 install jupyterlab
```
This one-liner may take some time to run, be patient. 

Now let's add the path to the jupyter program so it is useable by your system.

```
echo 'PATH=$PATH:/home/pi/.local/bin'>>.bashrc
```

What this step is doing: it installs jupyter and then adds the path to your startup environment in the shell so that jupyter is reachable.

8. Install CUPS and the appropriate drivers for your printer. Be sure your printers are plugged into your Raspberry Pi on the USB ports, and are powered on. 
This step can be gnary but if you're patient you can make it work! Promise! 

First you need to install the CUPS base print system. 

```
sudo apt-get install cups
sudo usermod -a -G lpadmin pi
sudo cupsctl --remote-any
sudo /etc/init.d/cups restart

```
Now let's reboot your Raspberry Pi **with your USB printers plugged into your Raspberry Pi**.

```
sudo reboot
```

Check out the printers as seen by your Raspberry Pi by "listing the USB devices attached"

```
lsusb
```

This will list **all** your attached devices not just your printers. Examine the list for your printers to be sure that they are all 
enumerated and recognized by the base Raspberry Pi system. My system shows these devices:

```
$ lsusb
Bus 001 Device 005: ID 0bda:8176 Realtek Semiconductor Corp. RTL8188CUS 802.11n WLAN Adapter
Bus 001 Device 004: ID 0922:0020 Dymo-CoStar Corp. LabelWriter 450
Bus 001 Device 003: ID 0424:ec00 Standard Microsystems Corp. SMSC9512/9514 Fast Ethernet Adapter
Bus 001 Device 002: ID 0424:9514 Standard Microsystems Corp. SMC9514 Hub
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
```

To be sure we have all the latest updates installed now that we have the base systems in place, it is sometimes useful to pause and 
update your Raspberry Pi like so: `sudo apt-get update`

9. Install the HP Drivers (covers most HP models)
```
sudo apt-get install --reinstall hpijs
sudo apt-get install hplip hplip-gui
sudo apt-get install hplip
```

As is customary with system software it is useful to reboot, like so: 

```
sudo reboot
```

10. Install the Dymo printer drivers (as another example)
Grab the latest Dymo drivers `tar` file and put them in a folder `dymo` on your raspberry pi.
TODO: add the `curl` example here to show this step

```
cd dymo/
tar -xvf dymo-cups-drivers-1.4.0.tar dymo-cups-drivers-1.4.0.5/
cd dymo-cups-drivers-1.4.0.5/
sudo ./configure 
sudo make install
sudo make 
sudo make clean
```


