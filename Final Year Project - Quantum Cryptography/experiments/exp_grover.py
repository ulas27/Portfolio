from __future__ import annotations

import json
from pathlib import Path

import matplotlib.pyplot as plt

from quantum_crypto.grover import run_grover_2q


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "outputs" / "grover"


def main() -> None:
    shots = 4096
    rows = []
    for it in range(0, 4):
        res = run_grover_2q(target="11", iterations=it, shots=shots, seed_simulator=1234)
        rows.append(res.__dict__)

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "grover_2q_sweep.json").write_text(json.dumps(rows, indent=2), encoding="utf-8")

    plt.figure(figsize=(7, 4))
    plt.plot([r["iterations"] for r in rows], [r["target_probability"] for r in rows], marker="o")
    plt.xlabel("Grover iterations")
    plt.ylabel("P(measure target)")
    plt.title("Grover (2 qubits): target amplification")
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(OUT / "grover_2q.png", dpi=160)

    print(f"Wrote Grover outputs to: {OUT}")


if __name__ == "__main__":
    main()

