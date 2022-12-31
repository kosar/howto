from nostr.key import PrivateKey

# Create a new key
private_key = PrivateKey()

# The public key hangs off the key
public_key = private_key.public_key
print(f"Private key: {private_key.bech32()}")
print(f"Public key: {public_key.bech32()}")
