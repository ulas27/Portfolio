## Threat model

The simulations assume an adversary with:

- Access to public information (e.g., RSA public key, BB84 basis announcements).
- Ability to intercept and resend qubits in BB84 (intercept-resend model).
- Ability to run repeated computations on classical hardware (experiments) and on a quantum simulator (small circuits).

Out of scope:

- Side-channel leakage (timing/power/EM), device imperfections, and implementation bugs in real hardware.
- Network-layer attacks unrelated to the cryptographic primitives.

## Safety / responsible use

- The RSA-breaking components target intentionally small moduli and are not designed for real-world key sizes.
- Results should be interpreted as demonstrations of algorithmic principles and scaling behaviour.

