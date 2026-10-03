from __future__ import annotations

import json
from pathlib import Path

import matplotlib.pyplot as plt

from quantum_crypto.shor_15 import factor_via_order, run_order_finding_15


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "outputs" / "shor15"


def main() -> None:
    res = run_order_finding_15(a=2, n_count=8, shots=4096, seed_simulator=1234)
    factors = None
    if res.inferred_r is not None:
        factors = factor_via_order(res.N, res.a, res.inferred_r)

    payload = {**res.__dict__, "factors": factors}

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "shor15_order_finding.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")

    labels = list(res.counts.keys())
    values = [res.counts[k] for k in labels]
    plt.figure(figsize=(7, 4))
    plt.bar(labels, values, edgecolor="black")
    plt.xlabel("Measured phase bits")
    plt.ylabel("Counts")
    plt.title("Shor (N=15): measurement distribution")
    plt.tight_layout()
    plt.savefig(OUT / "shor15_counts.png", dpi=160)

    print(f"Wrote Shor(N=15) outputs to: {OUT}")


if __name__ == "__main__":
    main()

