from __future__ import annotations

import json
import math
from pathlib import Path

import matplotlib.pyplot as plt

from quantum_crypto.grover import run_grover


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "outputs" / "grover"


def _suggest_iters(n: int) -> int:
    # For one marked item: ~pi/4 * sqrt(N)
    return max(1, int((math.pi / 4.0) * math.sqrt(2**n)))


def main() -> None:
    shots = 4096
    ns = [2, 3, 4]
    target_by_n = {n: "1" * n for n in ns}

    rows = []
    for n in ns:
        target = target_by_n[n]
        max_it = min(8, 2**n)
        for it in range(0, max_it + 1):
            res = run_grover(target=target, iterations=it, shots=shots, seed_simulator=1234)
            rows.append(
                {
                    "n_qubits": n,
                    "target": target,
                    "iterations": it,
                    "shots": shots,
                    "target_probability": res.target_probability,
                    "suggested_iterations": _suggest_iters(n),
                }
            )

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "grover_scale.json").write_text(json.dumps(rows, indent=2), encoding="utf-8")

    plt.figure(figsize=(7, 4))
    for n in ns:
        xs = [r["iterations"] for r in rows if r["n_qubits"] == n]
        ys = [r["target_probability"] for r in rows if r["n_qubits"] == n]
        plt.plot(xs, ys, marker="o", label=f"{n} qubits")
    plt.xlabel("Grover iterations")
    plt.ylabel("P(measure target)")
    plt.title("Grover success vs iterations (2/3/4 qubits)")
    plt.grid(True, alpha=0.3)
    plt.legend()
    plt.tight_layout()
    plt.savefig(OUT / "grover_scale.png", dpi=160)

    print(f"Wrote Grover scaling outputs to: {OUT}")


if __name__ == "__main__":
    main()

