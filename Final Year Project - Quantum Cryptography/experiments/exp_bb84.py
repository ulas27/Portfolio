from __future__ import annotations

import json
from pathlib import Path

import matplotlib.pyplot as plt

from quantum_crypto.bb84 import sweep_bb84_qber


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "outputs" / "bb84"


def main() -> None:
    sizes = [32, 64, 128, 256]
    trials = 30

    no_eve = sweep_bb84_qber(sizes, trials=trials, seed=1234, eve=False)
    with_eve = sweep_bb84_qber(sizes, trials=trials, seed=1234, eve=True)

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "bb84_qber.json").write_text(
        json.dumps(
            {
                "sizes": sizes,
                "trials": trials,
                "no_eve": [{"n": n, "mean_qber": q, "mean_sifted_len": l} for (n, q, l) in no_eve],
                "with_eve": [{"n": n, "mean_qber": q, "mean_sifted_len": l} for (n, q, l) in with_eve],
            },
            indent=2,
        ),
        encoding="utf-8",
    )

    plt.figure(figsize=(7, 4))
    plt.plot([n for (n, _, _) in no_eve], [q for (_, q, _) in no_eve], marker="o", label="No Eve")
    plt.plot([n for (n, _, _) in with_eve], [q for (_, q, _) in with_eve], marker="o", label="Intercept-resend Eve")
    plt.xlabel("Raw qubits sent (n)")
    plt.ylabel("QBER on sifted key")
    plt.title("BB84: QBER vs key size")
    plt.grid(True, alpha=0.3)
    plt.legend()
    plt.tight_layout()
    plt.savefig(OUT / "bb84_qber.png", dpi=160)

    print(f"Wrote BB84 outputs to: {OUT}")


if __name__ == "__main__":
    main()

