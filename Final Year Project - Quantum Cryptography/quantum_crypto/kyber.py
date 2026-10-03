from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

# Kyber is standardised as ML-KEM; pqcrypto exposes it under ml_kem_*.
from pqcrypto.kem import ml_kem_512, ml_kem_768, ml_kem_1024


KyberLevel = Literal["kyber512", "kyber768", "kyber1024"]


@dataclass(frozen=True)
class KyberKEMResult:
    level: KyberLevel
    public_key_bytes: int
    secret_key_bytes: int
    ciphertext_bytes: int
    shared_secret_bytes: int
    ok: bool


def _impl(level: KyberLevel):
    if level == "kyber512":
        return ml_kem_512
    if level == "kyber768":
        return ml_kem_768
    return ml_kem_1024


def kem_roundtrip(*, level: KyberLevel = "kyber512") -> KyberKEMResult:
    impl = _impl(level)

    pk, sk = impl.generate_keypair()
    ct, ss1 = impl.encrypt(pk)
    ss2 = impl.decrypt(sk, ct)

    return KyberKEMResult(
        level=level,
        public_key_bytes=len(pk),
        secret_key_bytes=len(sk),
        ciphertext_bytes=len(ct),
        shared_secret_bytes=len(ss1),
        ok=(ss1 == ss2),
    )

