from __future__ import annotations

import json
from pathlib import Path

import matplotlib.pyplot as plt

from quantum_crypto.rsa_break import break_rsa_modulus_classical, generate_rsa_keypair


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "outputs" / "rsa_break"


def main() -> None:
    trials = 20
    prime_bits_list = [6, 7, 8, 9]

    rows = []
    for prime_bits in prime_bits_list:
        for i in range(trials):
            key = generate_rsa_keypair(prime_bits=prime_bits, seed=1000 + prime_bits * 100 + i)
            attempts = break_rsa_modulus_classical(
                key.N,
                seed=2000 + prime_bits * 100 + i,
                max_attempts=40,
                max_period_search=min(15000, key.N),
            )
            success = attempts[-1].factor is not None
            rows.append(
                {
                    "trial": i,
                    "prime_bits": prime_bits,
                    "N_bits": key.N.bit_length(),
                    "N": key.N,
                    "e": key.e,
                    "attempts": len(attempts),
                    "success": success,
                    "total_elapsed_ms": sum(a.elapsed_ms for a in attempts),
                }
            )

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "rsa_break_trials.json").write_text(json.dumps(rows, indent=2), encoding="utf-8")

    plt.figure(figsize=(7, 4))
    by_bits = {b: [r for r in rows if r["prime_bits"] == b] for b in prime_bits_list}
    x = [str(b) for b in prime_bits_list]
    mean_attempts = [sum(r["attempts"] for r in by_bits[b]) / len(by_bits[b]) for b in prime_bits_list]
    mean_ms = [sum(r["total_elapsed_ms"] for r in by_bits[b]) / len(by_bits[b]) for b in prime_bits_list]

    plt.plot(x, mean_attempts, marker="o", label="Mean attempts")
    plt.plot(x, mean_ms, marker="o", label="Mean time (ms)")
    plt.xlabel("Prime size (bits)")
    plt.ylabel("Mean value")
    plt.title("RSA breaking: attempts and time vs modulus size")
    plt.grid(True, alpha=0.3)
    plt.legend()
    plt.tight_layout()
    plt.savefig(OUT / "rsa_break_scale.png", dpi=160)

    print(f"Wrote RSA breaking outputs to: {OUT}")


if __name__ == "__main__":
    main()

