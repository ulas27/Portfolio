# Quantum Cryptography (Qiskit Simulations)

This repository contains simulations for **quantum cryptography** and **quantum-accelerated cryptanalysis**, implemented with **Qiskit**.

## What is included

- **BB84** key distribution simulation with optional **intercept-resend** eavesdropper and quantitative **QBER** measurement.
- **Grover** search (2 qubits) with a sweep of iterations and measured success probability.
- **Shor (N=15)**: order-finding on a simulator and factor extraction for \(N=15\).
- **Kyber (KEM)**: post-quantum key encapsulation roundtrip with timing and size measurements.
- **Kyber + Grover link**: a small Grover circuit where the 2-bit target is derived from a Kyber shared secret.
- **RSA modulus breaking (small N)**: repeated trials with attempt counts and timing measurements.

## Setup (Windows / PowerShell)

Create and activate a virtual environment, then install dependencies:

```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Optional (tests):

```bash
pip install -r requirements-dev.txt
pytest -q
```

## Run experiments (separately)

```bash
python -m experiments.exp_bb84
python -m experiments.exp_grover
python -m experiments.exp_grover_scale
python -m experiments.exp_shor15
python -m experiments.exp_kyber
python -m experiments.exp_kyber_grover
python -m experiments.exp_rsa_break
```

Outputs are written to:
- `outputs/bb84/` (QBER JSON + figure)
- `outputs/grover/` (sweep JSON + figure)
- `outputs/grover/` (2/3/4 qubits JSON + figure)
- `outputs/shor15/` (order-finding JSON)
- `outputs/kyber/` (KEM JSON + figure)
- `outputs/kyber/` (Kyber+Grover JSON + figure)
- `outputs/rsa_break/` (trial JSON + scale figure)

## Notes

See:
- `docs/limits.md` (scope and limitations)
- `docs/threat.md` (threat model and safety notes)

Optional (runs everything in one go):

```bash
python -m experiments.run_all
```

## Run individual demos (CLI)

```bash
python -m quantum_crypto bb84 --sizes 32,64,128 --trials 30
python -m quantum_crypto bb84 --sizes 32,64,128 --trials 30 --eve

python -m quantum_crypto grover --target 11 --iterations 1 --shots 2048

python -m quantum_crypto shor15 --a 2 --n-count 8 --shots 4096

python -m quantum_crypto rsa-break --prime-bits 7 --max-attempts 25 --seed 1234
```

