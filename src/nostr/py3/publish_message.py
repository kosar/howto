import json 
import ssl
import time
import sys
from nostr.event import Event
from nostr.relay_manager import RelayManager
from nostr.message_type import ClientMessageType
from nostr.key import PrivateKey
import pickle

try:
    relay_manager = RelayManager()
    relay_manager.add_relay("ws://192.168.87.68:8080")
    relay_manager.open_connections({"cert_reqs": ssl.CERT_NONE}) # NOTE: This disables ssl certificate verification
    time.sleep(1.25) # allow the connections to open
except Exception as err:
    print(f"Unexpected {err=}, {type(err)=}")
    print ('Unable to set up relay manager... Check Relay URL...exiting to be safe.')
    sys.exit(-1)

private_key=None

try:
    file = open('key', 'xb')
    private_key = PrivateKey()
    pickle.dump(private_key, file)
    file.close()

except FileExistsError:
    file = open('key', 'rb')
    private_key = pickle.load(file)
    file.close()

if private_key: print(private_key.public_key.hex())

t = time.localtime()
current_time = time.strftime("%H:%M:%S", t)

event = Event(private_key.public_key.hex(), "Hello Nostr From Raspberry Pi! (Current time: " + current_time + ")")
event.sign(private_key.hex())

message = json.dumps([ClientMessageType.EVENT, event.to_json_object()])

try:
    relay_manager.publish_message(message)
    relay_manager.close_connections()
except Exception as err:
    print(f"Unexpected {err=}, {type(err)=}")
    sys.exit(-1)
