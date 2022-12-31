import json
import ssl
import time
from nostr.filter import Filter, Filters
from nostr.event import Event, EventKind
from nostr.relay_manager import RelayManager
from nostr.message_type import ClientMessageType
from nostr.key import PrivateKey
import pickle

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

filters = Filters([Filter(authors=[private_key.public_key.hex()], kinds=[EventKind.TEXT_NOTE])])
subscription_id = "test_subcription"
request = [ClientMessageType.REQUEST, subscription_id]
request.extend(filters.to_json_array())

relay_manager = RelayManager()
relay_manager.add_relay("ws://192.168.87.68:8080")
relay_manager.add_subscription(subscription_id, filters)
relay_manager.open_connections({"cert_reqs": ssl.CERT_NONE}) # NOTE: This disables ssl certificate verification
time.sleep(1.25) # allow the connections to open

message = json.dumps(request)
relay_manager.publish_message(message)
time.sleep(1) # allow the messages to send

while relay_manager.message_pool.has_events():
  event_msg = relay_manager.message_pool.get_event()
  print(event_msg.event.content)
  
relay_manager.close_connections()
