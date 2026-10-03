from __future__ import annotations

from quantum_crypto.kyber import kem_roundtrip


def test_kyber_roundtrip_shared_secret_matches() -> None:
    res = kem_roundtrip(level="kyber512")
    assert res.ok is True
    assert res.shared_secret_bytes > 0

