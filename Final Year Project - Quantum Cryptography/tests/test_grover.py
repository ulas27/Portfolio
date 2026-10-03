from __future__ import annotations

from quantum_crypto.grover import run_grover_2q


def test_grover_amplifies_target_state() -> None:
    baseline = run_grover_2q(iterations=0, shots=1024, seed_simulator=1234)
    amplified = run_grover_2q(iterations=1, shots=1024, seed_simulator=1234)

    assert 0.15 <= baseline.target_probability <= 0.35
    assert amplified.target_probability >= 0.8

