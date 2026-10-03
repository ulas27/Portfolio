from __future__ import annotations

import matplotlib.pyplot as plt

from quantum_crypto.bb84 import sweep_bb84_qber


def main() -> None:
    sizes = [32, 64, 128, 256, 512]
    no_eve = sweep_bb84_qber(sizes, trials=30, seed=1234, eve=False)
    with_eve = sweep_bb84_qber(sizes, trials=30, seed=1234, eve=True)

    print("BB84 QBER sweep")
    for (n, q0, l0), (_, q1, l1) in zip(no_eve, with_eve):
        print(f"n={n:>4} | no-eve qber={q0:.3f} (sifted~{l0:.1f}) | eve qber={q1:.3f} (sifted~{l1:.1f})")

    plt.figure(figsize=(7, 4))
    plt.plot([n for (n, _, _) in no_eve], [q for (_, q, _) in no_eve], marker="o", label="No Eve")
    plt.plot([n for (n, _, _) in with_eve], [q for (_, q, _) in with_eve], marker="o", label="Intercept-resend Eve")
    plt.xlabel("Raw qubits sent (n)")
    plt.ylabel("QBER on sifted key")
    plt.title("BB84: QBER vs key size")
    plt.grid(True, alpha=0.3)
    plt.legend()
    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    main()