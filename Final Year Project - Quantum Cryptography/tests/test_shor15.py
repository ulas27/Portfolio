from __future__ import annotations

from quantum_crypto.shor_15 import factor_via_order, run_order_finding_15


def test_shor15_finds_factors() -> None:
    res = run_order_finding_15(a=2, n_count=8, shots=1024, seed_simulator=1234)
    assert res.inferred_r in (2, 4)
    assert res.inferred_r is not None
    factors = factor_via_order(res.N, res.a, res.inferred_r)
    assert factors is not None
    assert set(factors) == {3, 5}

