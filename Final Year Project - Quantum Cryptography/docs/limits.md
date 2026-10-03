## Limitations and scope

- **BB84 model**: The BB84 simulation uses an idealised measurement model to estimate QBER under intercept-resend. It does not model device noise, loss, or detector inefficiencies.
- **Shor demo (N=15)**: The order-finding circuit is intended for simulator-based demonstration on a small modulus. It is not a practical RSA-breaking implementation for real key sizes.
- **Grover demo (2 qubits)**: The Grover circuit is a minimal example that demonstrates amplitude amplification on a tiny search space.
- **RSA breaking experiment**: The RSA breaking experiment targets small moduli and uses a classical period search to produce measurable results for comparison and evaluation.

