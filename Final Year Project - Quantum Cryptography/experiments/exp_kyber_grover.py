from __future__ import annotations

import json
from pathlib import Path

import matplotlib.pyplot as plt

from quantum_crypto.grover import run_grover_2q
from quantum_crypto.kyber import kem_roundtrip


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "outputs" / "kyber"


def _first_two_bits_of_shared_secret() -> str:
    # Use Kyber to produce a shared secret, then take 2 bits to form a tiny target.
    # This keeps the Grover circuit small (2 qubits) while linking the run to Kyber output.
    res = kem_roundtrip(level="kyber512")
    if not res.ok:
        raise RuntimeError("KEM roundtrip failed")

    # Shared secret length is fixed (32 bytes). We only need 2 bits for the demo target.
    # Derive a deterministic 2-bit target from a fresh Kyber shared secret by re-running
    # the roundtrip and grabbing the first byte.
    #
    # Note: This is intentionally a tiny search space demonstration.
    from pqcrypto.kem import ml_kem_512

    pk, sk = ml_kem_512.generate_keypair()
    ct, ss = ml_kem_512.encrypt(pk)
    ss2 = ml_kem_512.decrypt(sk, ct)
    if ss != ss2:
        raise RuntimeError("Shared secret mismatch")

    b0 = ss[0]
    return f"{(b0 >> 7) & 1}{(b0 >> 6) & 1}"


def main() -> None:
    target = _first_two_bits_of_shared_secret()

    # Baseline vs one Grover iteration
    base = run_grover_2q(target=target, iterations=0, shots=2048, seed_simulator=1234)
    amp = run_grover_2q(target=target, iterations=1, shots=2048, seed_simulator=1234)

    payload = {
        "kyber_level": "kyber512",
        "target_2bit": target,
        "baseline": base.__dict__,
        "amplified": amp.__dict__,
    }

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "kyber_grover_2bit.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")

    plt.figure(figsize=(7, 4))
    plt.bar(["iterations=0", "iterations=1"], [base.target_probability, amp.target_probability])
    plt.ylim(0.0, 1.0)
    plt.ylabel("P(measure target)")
    plt.title("Grover amplification (2-bit target derived from Kyber shared secret)")
    plt.tight_layout()
    plt.savefig(OUT / "kyber_grover_2bit.png", dpi=160)

    print(f"Wrote Kyber-Grover outputs to: {OUT}")


if __name__ == "__main__":
    main()

