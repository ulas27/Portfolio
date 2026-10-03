from __future__ import annotations

import matplotlib.pyplot as plt

from quantum_crypto.grover import run_grover_2q


def main() -> None:
    res = run_grover_2q(target="11", iterations=1, shots=2048, seed_simulator=1234)
    print("Grover (2 qubits) demo")
    print(f"Target: {res.target}")
    print(f"Iterations: {res.iterations}")
    print(f"Target probability: {res.target_probability:.3f}")
    print("Counts:", res.counts)

    plt.figure(figsize=(6, 3.5))
    labels = list(res.counts.keys())
    values = [res.counts[k] for k in labels]
    plt.bar(labels, values)
    plt.title("Grover measurement counts")
    plt.xlabel("Bitstring")
    plt.ylabel("Counts")
    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    main()