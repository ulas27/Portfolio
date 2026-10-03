from qiskit import QuantumCircuit, transpile
from qiskit_aer import Aer
import math
import random
from fractions import Fraction

random.seed()  # Truly random each time

print("=" * 70)
print("SHOR'S ALGORITHM - Realistic RSA Breaking Simulation")
print("Fully randomized cryptographic scenario")
print("=" * 70)

# ============================================
# CRYPTOGRAPHIC PRIMITIVES
# ============================================

def gcd(a, b):
    """Euclidean algorithm for GCD"""
    while b:
        a, b = b, a % b
    return a

def is_prime(n, k=10):
    """Miller-Rabin primality test"""
    if n < 2:
        return False
    if n == 2 or n == 3:
        return True
    if n % 2 == 0:
        return False
    
    # Write n-1 as 2^r * d
    r, d = 0, n - 1
    while d % 2 == 0:
        r += 1
        d //= 2
    
    # Witness loop
    for _ in range(k):
        a = random.randrange(2, n - 1)
        x = pow(a, d, n)
        
        if x == 1 or x == n - 1:
            continue
        
        for _ in range(r - 1):
            x = pow(x, 2, n)
            if x == n - 1:
                break
        else:
            return False
    
    return True

def generate_prime(bits):
    """Generate random prime with specified bit length"""
    while True:
        # Generate random odd number
        n = random.getrandbits(bits)
        n |= (1 << bits - 1) | 1  # Set MSB and LSB
        
        if is_prime(n):
            return n

def mod_inverse(e, phi):
    """Extended Euclidean algorithm for modular inverse"""
    def extended_gcd(a, b):
        if a == 0:
            return b, 0, 1
        gcd_val, x1, y1 = extended_gcd(b % a, a)
        x = y1 - (b // a) * x1
        y = x1
        return gcd_val, x, y
    
    gcd_val, x, _ = extended_gcd(e % phi, phi)
    if gcd_val != 1:
        return None
    return (x % phi + phi) % phi

def generate_rsa_keypair(bits=8):
    """
    Generate realistic RSA key pair
    bits: bit length for each prime (total N will be 2*bits)
    """
    print(f"\nGenerating {2*bits}-bit RSA keys...")
    
    # Generate two distinct random primes
    print("  Generating prime p...")
    p = generate_prime(bits)
    
    print("  Generating prime q...")
    q = generate_prime(bits)
    while q == p:  # Ensure p != q
        q = generate_prime(bits)
    
    # Compute N and phi
    N = p * q
    phi = (p - 1) * (q - 1)
    
    # Choose public exponent e
    # Common choices: 3, 65537, or random prime
    common_e = [3, 5, 17, 257, 65537]
    valid_e = [e for e in common_e if e < phi and gcd(e, phi) == 1]
    
    if valid_e:
        e = random.choice(valid_e)
    else:
        # Fallback: find random coprime
        e = random.randrange(3, phi, 2)
        while gcd(e, phi) != 1:
            e = random.randrange(3, phi, 2)
    
    # Compute private exponent d
    d = mod_inverse(e, phi)
    
    if d is None:
        raise ValueError("Failed to compute modular inverse")
    
    return {
        'p': p, 'q': q, 'N': N, 'phi': phi,
        'e': e, 'd': d,
        'bits': 2 * bits
    }

# ============================================
# PERIOD FINDING (Classical simulation of quantum)
# ============================================

def find_period_classical(a, N, max_attempts=1000):
    """
    Classical period finding
    In real Shor's algorithm, this uses quantum Fourier transform
    """
    for r in range(1, min(N, max_attempts)):
        if pow(a, r, N) == 1:
            return r
    return None

def shor_factorize(N, verbose=True):
    """
    Shor's factorization algorithm
    Returns (p, q) if successful, None otherwise
    """
    if verbose:
        print(f"\nAttempting to factor N = {N}")
    
    # Try multiple random bases
    max_attempts = 20
    attempts = 0
    
    while attempts < max_attempts:
        attempts += 1
        
        # Choose random a in range [2, N-1]
        a = random.randint(2, N - 1)
        
        if verbose:
            print(f"\n  Attempt {attempts}: a = {a}")
        
        # Check if we got lucky with GCD
        g = gcd(a, N)
        if g > 1:
            if verbose:
                print(f"    Lucky! GCD({a}, {N}) = {g}")
            return g, N // g
        
        # Find period
        if verbose:
            print(f"    Finding period of {a}^x mod {N}...")
        
        r = find_period_classical(a, N)
        
        if r is None:
            if verbose:
                print(f"    Period not found, trying next a")
            continue
        
        if verbose:
            print(f"    Period r = {r}")
        
        # Check if period is even
        if r % 2 != 0:
            if verbose:
                print(f"    Period is odd, trying next a")
            continue
        
        # Compute potential factors
        x = pow(a, r // 2, N)
        
        if x == 1 or x == N - 1:
            if verbose:
                print(f"    Trivial case (x={x}), trying next a")
            continue
        
        # Try to extract factors
        p_candidate = gcd(x - 1, N)
        q_candidate = gcd(x + 1, N)
        
        if verbose:
            print(f"    GCD({x} - 1, {N}) = {p_candidate}")
            print(f"    GCD({x} + 1, {N}) = {q_candidate}")
        
        # Check if we found non-trivial factors
        if 1 < p_candidate < N:
            if verbose:
                print(f"    SUCCESS! Found factors")
            return p_candidate, N // p_candidate
        
        if 1 < q_candidate < N:
            if verbose:
                print(f"    SUCCESS! Found factors")
            return q_candidate, N // q_candidate
        
        if verbose:
            print(f"    No factors found with this a")
    
    if verbose:
        print(f"\n  Failed after {max_attempts} attempts")
    return None, None

# ============================================
# MAIN SIMULATION
# ============================================

def run_realistic_simulation():
    """Complete realistic RSA breaking scenario"""
    
    # Step 1: Generate RSA keys
    print("\n" + "="*70)
    print("STEP 1: RSA KEY GENERATION")
    print("="*70)
    
    # Generate 8-bit primes (16-bit N) - small for demo
    # Real RSA uses 1024 or 2048 bits!
    keys = generate_rsa_keypair(bits=7)
    
    print(f"\nGenerated RSA parameters:")
    print(f"  Prime p = {keys['p']} ({keys['p'].bit_length()} bits)")
    print(f"  Prime q = {keys['q']} ({keys['q'].bit_length()} bits)")
    print(f"  Modulus N = {keys['N']} ({keys['N'].bit_length()} bits)")
    print(f"  Totient phi = {keys['phi']}")
    print(f"  Public exponent e = {keys['e']}")
    print(f"  Private exponent d = {keys['d']}")
    
    print(f"\n  PUBLIC KEY:  (N={keys['N']}, e={keys['e']})")
    print(f"  PRIVATE KEY: (N={keys['N']}, d={keys['d']}) [SECRET]")
    
    # Step 2: Encrypt a message
    print("\n" + "="*70)
    print("STEP 2: MESSAGE ENCRYPTION")
    print("="*70)
    
    # Generate random message < N
    message = random.randint(2, keys['N'] - 1)
    ciphertext = pow(message, keys['e'], keys['N'])
    
    print(f"\n  Alice's secret message: m = {message}")
    print(f"  Encryption: c = m^e mod N")
    print(f"            c = {message}^{keys['e']} mod {keys['N']}")
    print(f"            c = {ciphertext}")
    
    # Verify correct decryption
    decrypted_original = pow(ciphertext, keys['d'], keys['N'])
    print(f"\n  Bob decrypts (with private key):")
    print(f"    m' = c^d mod N = {ciphertext}^{keys['d']} mod {keys['N']} = {decrypted_original}")
    print(f"    Verification: m' = m? {decrypted_original == message}")
    
    # Step 3: Attack
    print("\n" + "="*70)
    print("STEP 3: CRYPTANALYSIS ATTACK")
    print("="*70)
    
    print(f"\n  Eve (attacker) intercepted:")
    print(f"    - Ciphertext: c = {ciphertext}")
    print(f"    - Public key: (N={keys['N']}, e={keys['e']})")
    
    print(f"\n  Eve doesn't know:")
    print(f"    - Prime factors: p={keys['p']}, q={keys['q']}")
    print(f"    - Private key: d={keys['d']}")
    print(f"    - Original message: m={message}")
    
    print(f"\n  Eve runs Shor's algorithm to factor N={keys['N']}...")
    
    # Run Shor's algorithm
    p_found, q_found = shor_factorize(keys['N'])
    
    if p_found and q_found:
        print("\n" + "="*70)
        print("ATTACK SUCCESSFUL - RSA BROKEN!")
        print("="*70)
        
        # Ensure p_found is smaller for consistency
        if p_found > q_found:
            p_found, q_found = q_found, p_found
        
        print(f"\n  Factors discovered by Eve:")
        print(f"    p' = {p_found}")
        print(f"    q' = {q_found}")
        print(f"    Verification: {p_found} × {q_found} = {p_found * q_found}")
        
        # Reconstruct private key
        phi_reconstructed = (p_found - 1) * (q_found - 1)
        d_reconstructed = mod_inverse(keys['e'], phi_reconstructed)
        
        print(f"\n  Eve reconstructs the private key:")
        print(f"    phi' = (p'-1)(q'-1) = {phi_reconstructed}")
        print(f"    d' = e^(-1) mod phi' = {d_reconstructed}")
        
        # Decrypt the message
        message_cracked = pow(ciphertext, d_reconstructed, keys['N'])
        
        print(f"\n  Eve decrypts the ciphertext:")
        print(f"    m' = c^d' mod N")
        print(f"    m' = {ciphertext}^{d_reconstructed} mod {keys['N']}")
        print(f"    m' = {message_cracked}")
        
        # Final comparison
        print("\n" + "="*70)
        print("COMPARISON TABLE")
        print("="*70)
        print(f"\n  {'Parameter':<20} {'Original (Bob)':<20} {'Cracked (Eve)':<20} {'Match':<10}")
        print("  " + "-"*66)
        print(f"  {'Prime p':<20} {keys['p']:<20} {p_found:<20} {keys['p']==p_found or keys['p']==q_found}")
        print(f"  {'Prime q':<20} {keys['q']:<20} {q_found:<20} {keys['q']==q_found or keys['q']==p_found}")
        print(f"  {'Private key d':<20} {keys['d']:<20} {d_reconstructed:<20} {keys['d']==d_reconstructed}")
        print(f"  {'Message m':<20} {message:<20} {message_cracked:<20} {message==message_cracked}")
        
        if message == message_cracked:
            print("\n  Result: Eve successfully broke RSA and read Alice's message!")
        else:
            print("\n  Result: Something went wrong in the attack")
            
    else:
        print("\n  Attack failed (rare - usually succeeds with enough attempts)")
    
    print("\n" + "="*70)
    print("SIMULATION COMPLETE")
    print(f"Run again for completely different random scenario!")
    print("="*70)

# ============================================
# RUN SIMULATION
# ============================================

if __name__ == "__main__":
    run_realistic_simulation()