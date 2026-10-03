from __future__ import annotations

from quantum_crypto.bb84 import sweep_bb84_qber


def test_bb84_qber_increases_with_intercept_resend() -> None:
    sizes = [128]
    no_eve = sweep_bb84_qber(sizes, trials=200, seed=1, eve=False)[0]
    with_eve = sweep_bb84_qber(sizes, trials=200, seed=1, eve=True)[0]

    _, qber_no_eve, _ = no_eve
    _, qber_eve, _ = with_eve

    assert qber_no_eve == 0.0
    assert 0.15 <= qber_eve <= 0.35

