from __future__ import annotations

import json
import time
from pathlib import Path

import matplotlib.pyplot as plt

from quantum_crypto.kyber import kem_roundtrip


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "outputs" / "kyber"


def _time_ms(fn, *, rounds: int) -> float:
    t0 = time.perf_counter()
    for _ in range(rounds):
        fn()
    return (time.perf_counter() - t0) * 1000.0 / rounds


def main() -> None:
    levels = ["kyber512", "kyber768", "kyber1024"]
    rounds = 50

    rows = []
    for lvl in levels:
        res = kem_roundtrip(level=lvl)  # type: ignore[arg-type]
        enc_ms = _time_ms(lambda: kem_roundtrip(level=lvl), rounds=rounds)  # type: ignore[arg-type]
        rows.append(
            {
                "level": lvl,
                "ok": res.ok,
                "public_key_bytes": res.public_key_bytes,
                "secret_key_bytes": res.secret_key_bytes,
                "ciphertext_bytes": res.ciphertext_bytes,
                "shared_secret_bytes": res.shared_secret_bytes,
                "avg_roundtrip_ms": enc_ms,
                "rounds": rounds,
            }
        )

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "kyber_kem.json").write_text(json.dumps(rows, indent=2), encoding="utf-8")

    plt.figure(figsize=(7, 4))
    plt.bar([r["level"] for r in rows], [r["avg_roundtrip_ms"] for r in rows])
    plt.xlabel("Parameter set")
    plt.ylabel("Avg KEM roundtrip (ms)")
    plt.title("Kyber KEM roundtrip timing")
    plt.tight_layout()
    plt.savefig(OUT / "kyber_kem_timing.png", dpi=160)

    print(f"Wrote Kyber outputs to: {OUT}")


if __name__ == "__main__":
    main()

